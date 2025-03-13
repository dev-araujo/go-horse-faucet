import { BlockchainConfig } from "../../config/blockchain.config";
import { ITokenService } from "./token.interface";
import { ethers } from "ethers";
import goHorseAbi from "../../contracts/amoy/GoHorse.json";

export class TokenService implements ITokenService {
  private contract: ethers.Contract;

  constructor() {
    const tokenAddress = BlockchainConfig.getTokenAddress();
    const signer = BlockchainConfig.getSigner();
    this.contract = new ethers.Contract(tokenAddress, goHorseAbi.abi, signer);
  }

  async mintTokens(to: string, amount: number): Promise<void> {
    const tx = await this.contract.mint(
      to,
      ethers.parseUnits(amount.toString(), 18)
    );
    await tx.wait();
  }

  async getMetadataAboutToken(): Promise<string> {
    return await this.contract.getMetadataUrl();
  }

  async getTotalMinted(): Promise<number> {
    const totalMinted = await this.contract.getTotalMinted();
    return Number(ethers.formatUnits(totalMinted, 18));
  }

  async getMaxSupply(): Promise<number> {
    const maxSupply = await this.contract.getMaxSupply();
    return Number(ethers.formatUnits(maxSupply, 18));
  }
}
