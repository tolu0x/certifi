import { Buffer } from "buffer";
import { IPFSHTTPClient, create } from "ipfs-http-client";

/**
 * Service for interacting with IPFS
 */
export class IPFSService {
  private ipfs: IPFSHTTPClient | null = null;
  private initialized = false;
  private initializationError: Error | null = null;

  private static instance: IPFSService;

  private constructor() {
    this.initialize();
  }

  /**
   * Get the singleton instance of IPFSService
   */
  public static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  /**
   * Initialize the IPFS client
   * Uses Infura as the default IPFS provider
   */
  private async initialize(): Promise<void> {
    try {
      const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
      const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;

      if (!projectId || !projectSecret) {
        throw new Error("IPFS project credentials not found");
      }

      // Create authentication header
      const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

      this.ipfs = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          authorization: auth,
        },
      });

      this.initialized = true;
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error("Failed to initialize IPFS");
      console.error("IPFS initialization error:", this.initializationError);
    }
  }

  /**
   * Check if the IPFS client is initialized
   */
  public isInitialized(): boolean {
    return this.initialized && this.ipfs !== null;
  }

  /**
   * Get the initialization error if any
   */
  public getInitializationError(): Error | null {
    return this.initializationError;
  }

  /**
   * Upload a file to IPFS
   * @param file The file to upload
   * @returns Promise resolving to the IPFS CID
   */
  public async uploadFile(file: File): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error("IPFS client not initialized");
    }

    try {
      const result = await this.ipfs!.add(file);
      return result.path;
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw error;
    }
  }

  /**
   * Upload JSON metadata to IPFS
   * @param metadata The metadata object to upload
   * @returns Promise resolving to the IPFS CID
   */
  public async uploadMetadata(metadata: any): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error("IPFS client not initialized");
    }

    try {
      const jsonString = JSON.stringify(metadata);
      const result = await this.ipfs!.add(jsonString);
      return result.path;
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      throw error;
    }
  }

  /**
   * Get the gateway URL for an IPFS CID
   * @param cid The IPFS CID
   * @returns The gateway URL
   */
  public getGatewayUrl(cid: string): string {
    // Remove ipfs:// prefix if present
    const cleanCid = cid.startsWith("ipfs://") ? cid.slice(7) : cid;
    return `https://ipfs.io/ipfs/${cleanCid}`;
  }
}

export const useIPFS = () => {
  const ipfsService = IPFSService.getInstance();

  return {
    uploadFile: (file: File) => ipfsService.uploadFile(file),
    uploadMetadata: (metadata: any) => ipfsService.uploadMetadata(metadata),
    getGatewayUrl: (cid: string) => ipfsService.getGatewayUrl(cid),
    isInitialized: ipfsService.isInitialized(),
    initializationError: ipfsService.getInitializationError(),
  };
};
