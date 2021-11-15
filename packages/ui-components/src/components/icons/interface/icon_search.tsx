import React from 'react';
import {IconType} from '..';

export const IconSearch: IconType = ({height = 16, width = 16, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        d="M15.6651 15.6652C15.8794 15.4508 15.9997 15.1602 15.9997 14.8572C15.9997 14.5541 15.8794 14.2635 15.6651 14.0492L12.6125 10.9966C12.5653 10.9505 12.5354 10.8895 12.5279 10.8239C12.5204 10.7583 12.5358 10.6922 12.5714 10.6366C13.5088 9.21769 13.8861 7.50127 13.63 5.82005C13.3739 4.13882 12.5028 2.61256 11.1854 1.53712C9.86798 0.461678 8.19822 -0.0863335 6.49977 -0.000683585C4.80131 0.0849663 3.19515 0.798176 1.99263 2.00069C0.79012 3.20321 0.0769097 4.80937 -0.00874022 6.50782C-0.0943901 8.20628 0.453621 9.87604 1.52906 11.1934C2.6045 12.5108 4.13077 13.382 5.81199 13.6381C7.49321 13.8941 9.20963 13.5169 10.6285 12.5794C10.6836 12.5433 10.7495 12.5271 10.815 12.5338C10.8806 12.5405 10.9419 12.5695 10.9885 12.616L14.0411 15.6686C14.1476 15.7756 14.2742 15.8606 14.4137 15.9184C14.5532 15.9762 14.7028 16.0058 14.8538 16.0055C15.0048 16.0052 15.1543 15.9749 15.2935 15.9165C15.4328 15.8581 15.5591 15.7727 15.6651 15.6652ZM2.28567 6.85715C2.28567 5.95301 2.55378 5.06917 3.05609 4.31741C3.55841 3.56564 4.27237 2.97971 5.10769 2.63371C5.94301 2.28771 6.86217 2.19718 7.74894 2.37357C8.63571 2.54996 9.45026 2.98534 10.0896 3.62467C10.7289 4.26399 11.1643 5.07854 11.3407 5.96531C11.5171 6.85208 11.4265 7.77125 11.0805 8.60656C10.7345 9.44188 10.1486 10.1558 9.39685 10.6582C8.64508 11.1605 7.76124 11.4286 6.8571 11.4286C5.64468 11.4286 4.48192 10.947 3.62461 10.0896C2.7673 9.23233 2.28567 8.06957 2.28567 6.85715Z"
        fill="currentColor"
      />
    </svg>
  );
};
