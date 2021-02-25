import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { useTokenBalance } from "eth-hooks";

export default function TokenBalance(props) {
  const [dollarMode, setDollarMode] = useState(false);

  const tokenContract = props.contracts && props.contracts[props.name];
  const balance = useTokenBalance(tokenContract, props.address, 1777);
  console.log("BALANCE", tokenContract, props.address, balance);

  let floatBalance = parseFloat("0.00");

  let usingBalance = balance;

  if (typeof props.balance !== "undefined") {
    usingBalance = props.balance;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toLocaleString("es-es");

  if (props.dollarMultiplier && dollarMode) {
    displayBalance = "$" + (floatBalance * props.dollarMultiplier).toLocaleString("es-es");
  }

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {displayBalance} {props.img} {props.name}
    </span>
  );
}
