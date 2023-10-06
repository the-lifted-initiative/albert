import { ProcessedEvent, useAllTransactionsList } from "../../../queries"
import { Button, Center, Spinner, Text } from "@liftedinit/ui"
import { EventType, MintEvent, SendEvent } from "@liftedinit/many-js"

export function TxnExport({
  address,
  symbol,
}: {
  address: string
  symbol?: string
}) {
  const accounts = symbol ? [address, symbol] : [address]
  const { data, isLoading, isError, error } = useAllTransactionsList({
    accounts,
  })

  const exportTransactions = () => {
    const events = data?.transactions
    if (!events || events.length === 0) return

    const filteredRows = events.map(event =>
      extractTxDetails({ address, event }),
    )

    const header = ["id", "date", "time", "type", "from", "to", "amount"].join(
      ",",
    )
    const rows = filteredRows
      .filter(event => event !== undefined) // Skip unsupported events
      .map(event => {
        return Object.values(event!).join(",")
      })
    const csvContent = [header, ...rows].join("\n")

    const file = new Blob([csvContent], { type: "text/csv" })
    const date = new Date().toISOString().split("T")[0]

    const a = document.createElement("a")
    a.href = URL.createObjectURL(file)
    a.download = `transactions_${date}.csv`
    a.click()
  }

  return (
    <>
      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : null}
      {isError && error ? (
        <Center>
          <Text fontSize="lg">{error}</Text>
        </Center>
      ) : null}
      <Button
        lineHeight="normal"
        size="sm"
        w={{ base: "full", md: "auto" }}
        onClick={exportTransactions}
      >
        Export
      </Button>
    </>
  )
}

interface TxDetails {
  id: string
  date: string
  time: string
  type: string
  from: string
  to: string
  amount: bigint
}

function extractTxDetails({
  address,
  event,
}: {
  address: string
  event: ProcessedEvent
}): TxDetails | undefined {
  const dateTime = new Date(event.time)
  const localDate = dateTime.toLocaleDateString()
  const localTime = dateTime.toLocaleTimeString()

  switch (event.type) {
    case EventType.send:
      const sendEvent = event as SendEvent
      let sendAmount = sendEvent.amount
      if (sendEvent.to !== address) {
        sendAmount = -sendAmount
      }
      return {
        id: event._id,
        date: localDate,
        time: localTime,
        type: sendEvent.type,
        from: sendEvent.from,
        to: sendEvent.to,
        amount: sendAmount,
      }
    case EventType.mint:
      const mintEvent = event as MintEvent
      const amount = BigInt(mintEvent.amounts[address])
      return {
        id: event._id,
        date: localDate,
        time: localTime,
        type: mintEvent.type,
        from: "",
        to: address,
        amount,
      }
    default:
      console.debug("Unsupported event type", event.type)
      return undefined
  }
}
