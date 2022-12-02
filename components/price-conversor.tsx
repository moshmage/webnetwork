import { useState } from "react";
import { isMobile } from "react-device-detect";

import getConfig from "next/config";

import { formatStringToCurrency } from "helpers/formatNumber";

import { Currency } from "interfaces/currency";

import PriceConversorModal from "./price-conversor-modal";

interface IPriceConversorProps {
  currentValue: string;
  currency: Currency | string;
}

export default function PriceConversor({
  currentValue,
  currency
}: IPriceConversorProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const {publicRuntimeConfig} = getConfig();

  return (
    <>
    <div onClick={()=> setIsVisible(publicRuntimeConfig?.enableCoinGecko && true)}
        className={
          `${(isMobile || !publicRuntimeConfig?.enableCoinGecko) && 
            'read-only-button-mobile'} price-conversor rounded-5 py-2 px-3 bg-black 
                   d-flex align-items-center justify-content-around cursor-pointer`}>
      <span className="text-white caption-large">
        {formatStringToCurrency(currentValue)}
      </span>
      <span className="text-primary ms-2 caption-medium">{currency}</span>
    </div>
    <PriceConversorModal show={isVisible} onClose={() => setIsVisible(false)}/>
    </>
  );
}
