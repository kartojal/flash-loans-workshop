/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect } from "react";
import { Button, List, Divider, Alert } from "antd";
import { Address, Balance, TokenBalance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { DAI_ABI as ERC20_ABI, AAVE_LENDING_POOL_ABI, PROTOCOL_DATA_PROVIDER_ABI } from "../constants";
import { useContractReader, useExternalContractLoader } from "../hooks";
import { buildFlashLiquidationAdapterParams } from "../helpers/encoder";
import { usePoller } from "eth-hooks";
import styled from "styled-components";

const BORROWER_ADDRESS = "0x43Ba3B417E914bED27DB8e16f4e9De0247Ba6597";
const DAI_STABLE_DEBT_TOKEN_ADDRESS = "0x778a13d3eeb110a4f7bb6529f99c000119a08e92";
const LINK_ATOKEN_ADDRESS = "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0";
const LENDING_POOL_V2 = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9";
const POOL_DATA_PROVIDER_ADDRESS = "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d";
const iconStyle = { height: 24, width: 24 };

// Prices  Feb-23-2021 09:01:06 AM +UTC for liquidation overview
const assetData = {
  WETH: {
    price: 1508,
    aTokenImg: "https://etherscan.io/token/images/Aave_aWETH_32.png",
  },
  LINK: {
    price: 25.3,
    aTokenImg: "https://etherscan.io/token/images/Aave_aLINK_32.png",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    img: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png?1547034700",
  },
  DAI: {
    price: 1,
    img: "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png?1574218774",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
};
const loadReserves = async (userAddress, poolDataProvider) => {
  if (!userAddress || !poolDataProvider) {
    return [];
  }
  const allReserves = await poolDataProvider.getAllReservesTokens();

  const allUserReserves = await Promise.all(
    allReserves.map(async reserveAddress => {
      return [
        reserveAddress[0],
        (await poolDataProvider.getUserReserveData(reserveAddress[1], userAddress))
          .slice(0, 3)
          .map(x => parseFloat(formatEther(x))),
      ];
    }),
  );

  return {
    aTokens: allUserReserves
      .filter(tuple => {
        const [, [aTokenBalance, ,]] = tuple;
        return aTokenBalance > 0.001;
      })
      .map(([symbol, [aToken]]) => [symbol, aToken]),
    stables: allUserReserves
      .filter(tuple => {
        const [, [, stable]] = tuple;
        return stable > 0.001;
      })
      .map(([symbol, [, stable]]) => [symbol, stable]),
    variables: allUserReserves
      .filter(tuple => {
        const [, [, , variable]] = tuple;
        return variable > 0.001;
      })
      .map(([symbol, [, , variable]]) => [symbol, variable]),
  };
};

const GridBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: 0px 0px;
  grid-template-areas: ". .";
`;

export default function Main({
  setPurposeEvents,
  address,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
}) {
  const [initialLoad, setInitialLoad] = useState(true);
  const [userReserves, setUserReserves] = useState([]);
  const [userBorrowStable, setUserStable] = useState([]);
  const [userBorrowVariable, setUserVariable] = useState([]);

  const POOL_DATA_PROVIDER = useExternalContractLoader(
    localProvider,
    POOL_DATA_PROVIDER_ADDRESS,
    PROTOCOL_DATA_PROVIDER_ABI,
  );
  const LINK_TOKEN = useExternalContractLoader(localProvider, assetData.LINK.address, ERC20_ABI);
  const LendingPool = useExternalContractLoader(localProvider, LENDING_POOL_V2, AAVE_LENDING_POOL_ABI);

  const userAccountData = useContractReader(
    { LendingPool },
    "LendingPool",
    "getUserAccountData",
    [BORROWER_ADDRESS],
    5000,
    a => JSON.parse(JSON.stringify(a)),
  );

  const health = userAccountData?.length ? parseFloat(formatEther(userAccountData[5])) : 0;
  const alertType = health < 1 ? "error" : "success";

  useEffect(() => {
    const loadEffect = async () => {
      const { aTokens, stables, variables } = await loadReserves(BORROWER_ADDRESS, POOL_DATA_PROVIDER);
      setUserReserves(aTokens);
      setUserStable(stables);
      setUserVariable(variables);
      setInitialLoad(false);
    };

    if (initialLoad && POOL_DATA_PROVIDER) {
      loadEffect();
    }
  }, [initialLoad, POOL_DATA_PROVIDER]);

  usePoller(async () => {
    if (POOL_DATA_PROVIDER) {
      const { aTokens, stables, variables } = await loadReserves(BORROWER_ADDRESS, POOL_DATA_PROVIDER);
      setUserReserves(aTokens);
      setUserStable(stables);
      setUserVariable(variables);
    }
  }, 15000);

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Flash Liquidation UI</h2>
        <Divider />
        <h1>Borrower view</h1>
        <GridBox>
          <div>
            <h2>Address</h2>
            <Address address={BORROWER_ADDRESS} fontSize={16} />
          </div>
          <div>
            <h2>Health</h2>
            <Alert message={health.toLocaleString()} type={alertType} style={{ width: "80px", margin: "0 auto" }} />
          </div>
        </GridBox>
        <br />
        <br />
        {!!userReserves?.length && (
          <>
            <h2>Reserves</h2>
            {userReserves.map(([symbol, aTokenBalance]) => (
              <p key={symbol}>
                <span>
                  {aTokenBalance.toLocaleString()} <img src={assetData[symbol].aTokenImg} style={iconStyle} /> {symbol}
                </span>
              </p>
            ))}
            <br />
          </>
        )}
        {!!userBorrowStable?.length && (
          <>
            <h2>Stable loans</h2>
            {userBorrowStable.map(([symbol, stable]) => (
              <p key={symbol}>
                {stable.toLocaleString()} <img src={assetData[symbol].img} style={iconStyle} /> {symbol}
              </p>
            ))}
            <br />
            <br />
          </>
        )}
        {!!userBorrowVariable?.length && (
          <>
            <h2>Variable loans</h2>
            {userBorrowVariable.map(([symbol, variable]) => (
              <p key={symbol}>
                {variable.toLocaleString()} {symbol}
              </p>
            ))}
          </>
        )}
        <Divider />
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              // Prepare params
              const daiDebt = parseEther("838971");

              const encodedParams = buildFlashLiquidationAdapterParams(
                assetData.LINK.address,
                assetData.DAI.address,
                BORROWER_ADDRESS,
                daiDebt,
                true,
              );
              // Execute flash loan
              const flashLoanParams = [
                [assetData.DAI.address], // Asset to request flash loan
                [daiDebt], // Amount of DAI to request
                ["0"], // Flash loan mode type, 0 means no open a debt and revert if flash loan principal is not paid
                encodedParams, // Encoded params
              ];
              tx(writeContracts.FlashLiquidationAdapter.requestFlashLoan(...flashLoanParams));
            }}
          >
            Liquidate Position ⚡
          </Button>
        </div>
        <Divider />
        Your Address:
        <Address address={address} fontSize={16} />
        <Divider />
        {/* use formatEther to display a BigNumber: */}
        <h2>Your Balance: </h2>
        <Balance address={address} provider={localProvider} price={price} />
        <br />
        <TokenBalance
          contracts={{ LINK: LINK_TOKEN }}
          name={"LINK"}
          address={address}
          provider={localProvider}
          dollarMultiplier={assetData.LINK.price}
          img={<img src={assetData.LINK.img} style={iconStyle} />}
        />
        <Divider />
        <Button
          onClick={() => {
            // Reset chain, keep in mind to deploy again via `yarn run deploy`.
            localProvider.send("hardhat_reset", [
              {
                forking: {
                  jsonRpcUrl: "https://eth-mainnet.alchemyapi.io/v2/h9TZx3zq0Ez_nNRahgbLy3X2cQTmHwnW",
                  blockNumber: 11912352,
                },
              },
            ]);
          }}
        >
          Revert Chain
        </Button>
      </div>

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={setPurposeEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.sender + "_" + item.purpose}>
                <Address address={item[0]} fontSize={16} /> =>
                {item[1]}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
