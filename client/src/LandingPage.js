import React, { useState } from "react";
import styled from "styled-components";
import { HdWalletSetup } from "./HdWallet";

const Logo = styled.img`
  height: 100px;
  width: 100px;
`;
const LoginText = styled.h3`
  text-align: center;
  margin-top: 20px;
`;
const Centered = styled.div`
  justify-content: center;
  display: flex;
`;

const services = [
  {
    name: "Slack",
    imgUrl: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png"
  },
  {
    name: "Expensify",
    imgUrl:
      "https://images.squarespace-cdn.com/content/5437534fe4b063c91fba5659/1550793175563-CTW5FHOY05KEIRU6FZLT/expensify-app-logo.png?format=750w&content-type=image%2Fpng"
  },
  {
    name: "Github",
    imgUrl:
      "https://github.githubassets.com/images/modules/logos_page/Octocat.png"
  },
  {
    name: "Google",
    imgUrl:
      "https://cdn.imgbin.com/5/1/2/imgbin-google-logo-g-suite-google-search-chrome-EcAGrdDu8ifPFwERsNhwqpLiT.jpg"
  }
];

export const LandingPage = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  return (
    <div>
      <div class="topnav">
        <p>{walletAddress}</p>
      </div>
      <div
        style={{
          width: "50%",
          margin: "auto",
          padding: 10,
          backgroundColor: "white"
        }}
      >
        <div className="services-container">
          {services.map(({ name, imgUrl }) => {
            return (
              <div className={`service ${walletAddress ? "" : "disabled"}`}>
                <p>{name}</p>
                <Logo src={imgUrl} alt="" />
              </div>
            );
          })}
        </div>
        <LoginText>Connect your hardware wallet to log in</LoginText>
        <Centered>
          <HdWalletSetup setWalletAddress={setWalletAddress} />
        </Centered>
      </div>
    </div>
  );
};
