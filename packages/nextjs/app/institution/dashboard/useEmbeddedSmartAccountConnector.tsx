import { EventEmitter } from 'events'
import { useEffect, useState } from 'react'
import { useChainId, useConfig, useReconnect } from 'wagmi'
import { getAddress, hexToBigInt } from 'viem'
import { injected } from 'wagmi/connectors'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'

/**
 * Hook: Register Privy Smart Wallet as wagmi connector
 */
export const useEmbeddedSmartAccountConnector = () => {
  const config = useConfig()
  const id = useChainId()
  const { client: isReady, getClientForChain } = useSmartWallets()
  const { reconnect } = useReconnect()
  const [isSmartWalletReady, setIsSmartWalletReady] = useState(false)

  console.log("chain", id)

  useEffect(() => {
    const setup = async () => {
      if (!isReady) return

      const client = await getClientForChain({ id })
      if (!client) return

      const smartAccountProvider = new SmartWalletEIP1193Provider(client, getClientForChain);

      // Build a wagmi connector for Privy smart wallet
      const smartAccountConnectorConstructor = injected({
        target: {
          provider: smartAccountProvider, // direct provider from Privy client
          id: 'io.privy.smart_wallet',
          name: 'Privy Smart Wallet',
          icon: '',
        },
      })

      // Register this connector with wagmi
      // @ts-ignore
      const smartAccountConnector = config._internal.connectors.setup(smartAccountConnectorConstructor)
      // @ts-ignore
      config._internal.connectors.setState([smartAccountConnector])
      // @ts-ignore
      await config.storage?.setItem('recentConnectorId', smartAccountConnector.id)

      setIsSmartWalletReady(true)
      reconnect() // force wagmi to use the smart wallet
    }

    setup()
  }, [config, id, isReady, getClientForChain, reconnect])

  return { isSmartWalletReady }
}


class SmartWalletEIP1193Provider extends EventEmitter {
  private smartWalletClient: any

  private readonly getClientForChain: (params: { id: number }) => Promise<any>

  constructor(client: any, getClientForChain: (params: { id: number }) => Promise<any>) {
    super()
    this.smartWalletClient = client
    this.getClientForChain = getClientForChain
  }

  async request(args: any): Promise<any> {
    const { method, params = [] } = args
    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return this.handleEthRequestAccounts()
      case 'eth_sendTransaction':
        return this.handleEthSendTransaction(params)
      case 'personal_sign':
        return this.handlePersonalSign(params as any)
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        return this.handleEthSignTypedDataV4(params as any)
      case 'eth_signTransaction':
        throw new Error('eth_signTransaction is not supported. Use eth_sendTransaction instead.')
      case 'wallet_switchEthereumChain': {
        const [{ chainId }] = params as [{ chainId: string }]
        if (!this.smartWalletClient?.account) {
          throw new Error('account not connected!')
        }
        const newClient = await this.getClientForChain({
          id: parseInt(chainId, 16),
        })
        if (!newClient) {
          throw new Error(`No smart wallet client found for chain ID ${chainId}`)
        }
        this.smartWalletClient = newClient
        this.emit('chainChanged', chainId)
        return null
      }
      default:
        return this.smartWalletClient?.transport.request({ method, params } as any)
    }
  }

  private async handleEthRequestAccounts(): Promise<string[]> {
    if (!this.smartWalletClient?.account) {
      return []
    }
    return [this.smartWalletClient.account.address]
  }

  private async handleEthSendTransaction(params: any): Promise<string> {
    const [tx] = params
    if (!this.smartWalletClient?.account) {
      throw new Error('account not connected!')
    }
    return this.smartWalletClient.sendTransaction({
      ...tx,
      value: tx.value ? hexToBigInt(tx.value) : undefined,
    })
  }

  private async handlePersonalSign(params: [string, string]): Promise<string> {
    if (!this.smartWalletClient?.account) {
      throw new Error('account not connected!')
    }

    const [message, address] = params
    if (getAddress(address) !== getAddress(this.smartWalletClient.account.address)) {
      throw new Error('cannot sign for address that is not the current account')
    }

    return this.smartWalletClient.signMessage({
      message,
    })
  }

  private async handleEthSignTypedDataV4(params: [string, any]): Promise<string> {
    if (!this.smartWalletClient?.account) {
      throw new Error('account not connected!')
    }

    const address = params[0]
    if (getAddress(address) !== getAddress(this.smartWalletClient.account.address)) {
      throw new Error('cannot sign for address that is not the current account')
    }

    const typedData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1]

    return this.smartWalletClient.signTypedData(typedData as any)
  }
}