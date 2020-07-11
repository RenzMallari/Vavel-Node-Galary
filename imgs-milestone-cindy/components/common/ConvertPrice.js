import React from "react";
import { getDataPriceConvert } from "../../redux/actions/priceConvert";
import { list_currencies } from "../../utils/constSetting";
import { useSelector, useDispatch } from "react-redux";
import { DEFAULT_CURRENCY } from "../../utils/constant";

export const PriceConvert = ({ amoutDefault, from = DEFAULT_CURRENCY, to }) => {
  const dispatch = useDispatch();
  const rates = useSelector(store => store.priceConvert.data.rates);
  React.useEffect(() => {
    if (rates && !Object.keys(rates).length) {
      dispatch(getDataPriceConvert());
    }
  }, [dispatch]);
  const priceData = useSelector(store => store.priceConvert.data);
  const convert = (amout, from, to) => {
    let amoutDefault = amout;
    if (amoutDefault) {
      if (from && to) {
        let rate_from = priceData.rates[from] || 1;
        let rate_to = priceData.rates[to] || 1;
        let money = amoutDefault * rate_to;
        if (from !== priceData.base) {
          money = (amoutDefault / rate_from) * rate_to;
        }
        money = money.toFixed(2);
        return money;
      } else return amoutDefault;
    } else return amoutDefault;
  };

  const priceConvert = convert(amoutDefault, from, to);

  return (
    <span>
      {list_currencies[to] && list_currencies[to].symbol}
      {priceConvert}
    </span>
  );
};

export default PriceConvert;
