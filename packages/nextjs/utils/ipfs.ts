import { create } from "ipfs-http-client";

// Configure IPFS client
const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: File | Blob): Promise<string> => {
  try {
    const added = await client.add(file);
    return added.path;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload to IPFS");
  }
};

export const getIPFSGatewayURL = (ipfsHash: string): string => {
  return `https://ipfs.io/ipfs/${ipfsHash}`;
};

export const fetchFromIPFS = async (ipfsHash: string): Promise<any> => {
  try {
    const response = await fetch(getIPFSGatewayURL(ipfsHash));
    if (!response.ok) throw new Error("Failed to fetch from IPFS");
    return await response.json();
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw new Error("Failed to fetch from IPFS");
  }
};
