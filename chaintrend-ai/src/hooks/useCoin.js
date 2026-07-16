import { useAppContext } from '../context/AppContext'
import { getCoinById } from '../data/coinData'

/** Convenience hook for the globally selected coin + setter. */
export function useCoin() {
  const { selectedCoinId, setSelectedCoinId } = useAppContext()
  const coin = getCoinById(selectedCoinId)
  return { coin, coinId: selectedCoinId, setCoinId: setSelectedCoinId }
}
