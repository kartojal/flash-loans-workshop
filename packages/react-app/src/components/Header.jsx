import React from "react";
import { PageHeader, Tag } from "antd";

// displays a page header

export default function Header() {
  return (
    <PageHeader
      title="👻 Aave"
      subTitle="Liquidations with flash loans"
      tags={
        <>
          <a href="https://aave.com/" target="_blank" rel="noopener noreferrer">
            <Tag color="purple">Aave Website</Tag>
          </a>
          <a href="https://docs.aave.com/" target="_blank" rel="noopener noreferrer">
            <Tag color="cyan">Aave Docs</Tag>
          </a>
          <a href="https://github.com/kartojal/flash-loans-workshop" target="_blank" rel="noopener noreferrer">
            <Tag color="yellow">Github</Tag>
          </a>
          <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank" rel="noopener noreferrer">
            <Tag color="blue">Powered by 🏗 scaffold-eth</Tag>
          </a>
        </>
      }
    />
  );
}
