import { ethers } from 'ethers';
import { AppMode, Chain } from 'types';
import erc20TokenAbi from 'utils/blockchain/abi/erc20.json';
import allowTokensAbi from 'utils/blockchain/abi/AllowTokensAbi.json';

const aggregatorAbi = [
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_basset',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_massetQuantity',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_userData',
        type: 'bytes',
      },
    ],
    name: 'redeemToBridge',
    outputs: [
      {
        internalType: 'uint256',
        name: 'massetRedeemed',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export type FastBTCWithdrawContractName =
  | 'btcToken'
  | 'btcWrapperToken'
  | 'aggregator'
  | 'aggregatorBasset'
  | 'aggregatorAllowTokens';

export type AppModelToContractAddressMap = Record<AppMode, string>;

export type ChainToContractsMap = {
  address: Partial<Record<Chain, AppModelToContractAddressMap>>;
  abi: ethers.ContractInterface;
};

export const contracts: Record<
  FastBTCWithdrawContractName,
  ChainToContractsMap
> = {
  // fastBtcBridge: {
  //   address: {
  //     [Chain.RSK]: {
  //       [AppMode.MAINNET]: '0x0D5006330289336ebdF9d0AC9E0674f91b4851eA',
  //       [AppMode.TESTNET]: '0x10C848e9495a32acA95F6c23C92eCA2b2bE9903A', // todo should be new?
  //     },
  //     [Chain.BSC]: {
  //       [AppMode.MAINNET]: ethers.constants.AddressZero, // todo
  //       [AppMode.TESTNET]: '0x10C848e9495a32acA95F6c23C92eCA2b2bE9903A',
  //     },
  //   },
  //   abi: fastBtcBridgeAbi,
  // },
  btcToken: {
    address: {
      [Chain.RSK]: {
        [AppMode.MAINNET]: ethers.constants.AddressZero,
        [AppMode.TESTNET]: ethers.constants.AddressZero,
      },
      [Chain.BSC]: {
        [AppMode.MAINNET]: '0x6a7F2d2e5D5756729e875c8F8fC254448E763Fdf',
        [AppMode.TESTNET]: '0xcF3D22A034Fa157985F0Fe71F15477446f80Be26',
      },
    },
    abi: erc20TokenAbi,
  },
  btcWrapperToken: {
    address: {
      [Chain.RSK]: {
        [AppMode.MAINNET]: ethers.constants.AddressZero, // todo
        [AppMode.TESTNET]: '0xf629e5c7527ac7bc9ce26bdd6d66f0eb955ef3b2',
      },
    },
    abi: erc20TokenAbi,
  },
  aggregator: {
    address: {
      [Chain.BSC]: {
        [AppMode.MAINNET]: '0x1dA3D286a3aBeaDb2b7677c99730D725aF58e39D',
        [AppMode.TESTNET]: '0x63f9a9145147330dFAdc991CC3821DF23879ae16',
      },
    },
    abi: aggregatorAbi,
  },
  aggregatorBasset: {
    address: {
      [Chain.BSC]: {
        [AppMode.MAINNET]: ethers.constants.AddressZero, // todo
        [AppMode.TESTNET]: '0xc41d41cb7a31c80662ac2d8ab7a7e5f5841eebc3',
      },
    },
    abi: erc20TokenAbi,
  },
  aggregatorAllowTokens: {
    address: {
      [Chain.RSK]: {
        [AppMode.MAINNET]: ethers.constants.AddressZero, // todo
        [AppMode.TESTNET]: '0xa9f2ccb27fe01479a1f21f3a236989c614f801bc',
      },
    },
    abi: allowTokensAbi,
  },
};
