import axios from "axios";
import {getBurnsQuery, getMintsQuery, getPoolHourDatasQuery, getPositionsBurnsQuery, getPositionsQuery, getRewardsQuery, getSwapsQuery} from "./query";
import {ClBurn, ClMint, clPoolHourDatas, ClPosition, clPositionBurns, ClSwap} from "../types";
import {appConfig} from "../config";

const token = '5c40d2c358402947268fad249597b50f'

const client = axios.create({
  baseURL: appConfig.shadowSubgraphUrl,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

export interface GetEventsFilter {
  poolSymbol?: string
  blockNumber_gt?: number
  startOfHour_gt?: number
  blockNumber_lte?: number
  timestamp_gt?: number
  owner?: string
  liquidity_gt?: number
  gauge?: string
  id?: string
}

export interface GetEventsSort {
  orderDirection?: 'asc' | 'desc'
  orderBy?: 'transaction__blockNumber'
}

export interface GetEventsParams {
  skip?: number
  first?: number
  filter?: GetEventsFilter
  sort?: GetEventsSort
}

export const getMintEvents = async (params: GetEventsParams) => {
  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getMintsQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Устанавливаем тип контента
    }
  })
  return data.data.clMints
}

export const getBurnEvents = async (params: GetEventsParams) => {
  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getBurnsQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Устанавливаем тип контента
    }
  })
  return data.data.clBurns
}

export const getSwapEvents = async (params: GetEventsParams) => {
  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getSwapsQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Устанавливаем тип контента
    }
  })
  return data.data.clSwaps
}

export const getPoolHourDatas = async (params: GetEventsParams) => {
  console.log(getPoolHourDatasQuery(params));

  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getPoolHourDatasQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Устанавливаем тип контента
    }
  })
  return data.data.clPoolHourDatas
}

export const getPositionsBurns = async (params: GetEventsParams) => {
  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getPositionsBurnsQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Устанавливаем тип контента
    }
  })
  return data.data.clPositionBurns
}

export const getPositions = async (params: GetEventsParams) => {
  console.log(getPositionsQuery(params));
  
  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getPositionsQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Устанавливаем тип контента
    }
  })

  return data.data.clPositions
}

export const getRewards = async (params: GetEventsParams) => {
  console.log(getRewardsQuery(params));

  // const { data } = await client.post<{
  //   data: {
  //     gaugeRewardClaims: any[]
  //   }
  // }>('/', {
  //   query: getRewardsQuery(params)
  // })

  const { data } = await axios.post("https://gateway.thegraph.com/api/subgraphs/id/HGyx7TCqgbWieay5enLiRjshWve9TjHwiug3m66pmLGR", {
    query: getRewardsQuery(params)
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  return data.data.gaugeRewardClaims
}
