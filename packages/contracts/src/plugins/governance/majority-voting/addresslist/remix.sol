
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

  /**
   * @title ContractName
   * @dev ContractDescription
   * @custom:dev-run-script scripts/deploy_with_ethers.ts
   */


contract randomSelect {


  mapping(uint => bool) public sample;
 //   constructor() {
 //       sample;
 //   }

    function randomSample(address[] memory members, uint256 sampleSize) public {
        require(sampleSize <= members.length, "Sample size exceeds number of members");
        uint256 index = uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % members.length;
        sample[index] = true;

        for (uint256 count = 0; count < sampleSize; count++) {
            if (index + index >= members.length) {
                index = (index + index) % members.length;
            } else {
                index += index;
            }
            while (sample[index]) {
                index++;
            }
            sample[index] = true;
        }
    }

}
