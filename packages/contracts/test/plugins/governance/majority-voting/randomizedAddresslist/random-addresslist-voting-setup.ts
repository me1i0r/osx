import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

import {AddresslistVotingSetup} from '../../../../../typechain';
import {deployNewDAO} from '../../../../test-utils/dao';
import {getInterfaceID} from '../../../../test-utils/interfaces';
import {Operation} from '../../../../../utils/types';
import {
  VotingSettings,
  VotingMode,
  pctToRatio,
  ONE_HOUR,
} from '../../../../test-utils/voting';
import metadata from '../../../../../src/plugins/governance/majority-voting/addresslist/build-metadata.json';
import {randomaddresslistVotingInterface} from './random-addresslist-voting';

let defaultData: any;
let defaultVotingSettings: VotingSettings;
let defaultMembers: string[];

const abiCoder = ethers.utils.defaultAbiCoder;
const AddressZero = ethers.constants.AddressZero;
const EMPTY_DATA = '0x';

// Permissions
const UPDATE_ADDRESSES_PERMISSION_ID = ethers.utils.id(
  'UPDATE_ADDRESSES_PERMISSION'
);
const UPDATE_VOTING_SETTINGS_PERMISSION_ID = ethers.utils.id(
  'UPDATE_VOTING_SETTINGS_PERMISSION'
);
const UPGRADE_PERMISSION_ID = ethers.utils.id('UPGRADE_PLUGIN_PERMISSION');
const EXECUTE_PERMISSION_ID = ethers.utils.id('EXECUTE_PERMISSION');

describe('RandomAddresslistVotingSetup', function () {
  let signers: SignerWithAddress[];
  let randomaddresslistVotingSetup: RandomAddresslistVotingSetup;
  let implementationAddress: string;
  let targetDao: any;

  before(async () => {
    signers = await ethers.getSigners();
    targetDao = await deployNewDAO(signers[0].address);

    defaultVotingSettings = {
      votingMode: VotingMode.EarlyExecution,
      supportThreshold: pctToRatio(50),
      minParticipation: pctToRatio(20),
      minDuration: ONE_HOUR,
      minProposerVotingPower: 0,
    };
    defaultMembers = [signers[0].address];

    const RandomAddresslistVotingSetup = await ethers.getContractFactory(
      'RandomAddresslistVotingSetup'
    );
    randomaddresslistVotingSetup = await RandomAddresslistVotingSetup.deploy();

    implementationAddress = await randomaddresslistVotingSetup.implementation();

    defaultData = abiCoder.encode(metadata.pluginSetupABI.prepareInstallation, [
      Object.values(defaultVotingSettings),
      defaultMembers,
    ]);
  });

  it('does not support the empty interface', async () => {
    expect(await randomaddresslistVotingSetup.supportsInterface('0xffffffff')).to.be
      .false;
  });

  it('creates address list voting base with the correct interface', async () => {
    const factory = await ethers.getContractFactory('RandomAddresslistVoting');
    const randomaddresslistVotingContract = factory.attach(implementationAddress);

    expect(
      await randomaddresslistVotingContract.supportsInterface(
        getInterfaceID(randomaddresslistVotingInterface)
      )
    ).to.be.eq(true);
  });

  describe('prepareInstallation', async () => {
    it('fails if data is empty, or not of minimum length', async () => {
      await expect(
        randomaddresslistVotingSetup.prepareInstallation(
          targetDao.address,
          EMPTY_DATA
        )
      ).to.be.reverted;

      await expect(
        randomaddresslistVotingSetup.prepareInstallation(
          targetDao.address,
          defaultData.substring(0, defaultData.length - 2)
        )
      ).to.be.reverted;

      await expect(
        randomaddresslistVotingSetup.prepareInstallation(
          targetDao.address,
          defaultData
        )
      ).not.to.be.reverted;
    });

    it('correctly returns plugin, helpers and permissions', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        randomaddresslistVotingSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: randomaddresslistVotingSetup.address,
        nonce,
      });

      const {
        plugin,
        preparedSetupData: {helpers, permissions},
      } = await randomaddresslistVotingSetup.callStatic.prepareInstallation(
        targetDao.address,
        defaultData
      );

      expect(plugin).to.be.equal(anticipatedPluginAddress);
      expect(helpers.length).to.be.equal(0);
      expect(permissions.length).to.be.equal(4);
      expect(permissions).to.deep.equal([
        [
          Operation.Grant,
          plugin,
          targetDao.address,
          AddressZero,
          UPDATE_ADDRESSES_PERMISSION_ID,
        ],
        [
          Operation.Grant,
          plugin,
          targetDao.address,
          AddressZero,
          UPDATE_VOTING_SETTINGS_PERMISSION_ID,
        ],
        [
          Operation.Grant,
          plugin,
          targetDao.address,
          AddressZero,
          UPGRADE_PERMISSION_ID,
        ],
        [
          Operation.Grant,
          targetDao.address,
          plugin,
          AddressZero,
          EXECUTE_PERMISSION_ID,
        ],
      ]);
    });

    it('correctly sets up the plugin', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        randomaddresslistVotingSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: randomaddresslistVotingSetup.address,
        nonce,
      });

      await randomaddresslistVotingSetup.prepareInstallation(
        targetDao.address,
        defaultData
      );

      const factory = await ethers.getContractFactory('RandomAddresslistVoting');
      const randomaddresslistVotingContract = factory.attach(
        anticipatedPluginAddress
      );
      const latestBlock = await ethers.provider.getBlock('latest');

      expect(await randomaddresslistVotingContract.dao()).to.be.equal(
        targetDao.address
      );
      expect(await randomaddresslistVotingContract.minParticipation()).to.be.equal(
        defaultVotingSettings.minParticipation
      );
      expect(await randomaddresslistVotingContract.supportThreshold()).to.be.equal(
        defaultVotingSettings.supportThreshold
      );

      expect(await randomaddresslistVotingContract.minDuration()).to.be.equal(
        defaultVotingSettings.minDuration
      );
      expect(
        await randomaddresslistVotingContract.minProposerVotingPower()
      ).to.be.equal(defaultVotingSettings.minProposerVotingPower);

      await ethers.provider.send('evm_mine', []);

      expect(
        await randomaddresslistVotingContract.addresslistLengthAtBlock(
          latestBlock.number
        )
      ).to.be.equal(defaultMembers.length);
      expect(
        await randomaddresslistVotingContract.isListedAtBlock(
          defaultMembers[0],
          latestBlock.number
        )
      ).to.be.equal(true);
    });
  });

  describe('prepareUninstallation', async () => {
    it('correctly returns permissions', async () => {
      const plugin = ethers.Wallet.createRandom().address;

      const permissions =
        await randomaddresslistVotingSetup.callStatic.prepareUninstallation(
          targetDao.address,
          {
            plugin,
            currentHelpers: [],
            data: EMPTY_DATA,
          }
        );

      expect(permissions.length).to.be.equal(4);
      expect(permissions).to.deep.equal([
        [
          Operation.Revoke,
          plugin,
          targetDao.address,
          AddressZero,
          UPDATE_ADDRESSES_PERMISSION_ID,
        ],
        [
          Operation.Revoke,
          plugin,
          targetDao.address,
          AddressZero,
          UPDATE_VOTING_SETTINGS_PERMISSION_ID,
        ],
        [
          Operation.Revoke,
          plugin,
          targetDao.address,
          AddressZero,
          UPGRADE_PERMISSION_ID,
        ],
        [
          Operation.Revoke,
          targetDao.address,
          plugin,
          AddressZero,
          EXECUTE_PERMISSION_ID,
        ],
      ]);
    });
  });
});
