import {ethers} from 'ethers';

export const buildFlashLiquidationAdapterParams = (
  collateralAsset,
  debtAsset,
  user,
  debtToCover,
  useEthPath
) => {
  return ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'address', 'uint256', 'bool'],
    [collateralAsset, debtAsset, user, debtToCover, useEthPath]
  );
};