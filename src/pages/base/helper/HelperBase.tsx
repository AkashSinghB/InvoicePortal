export const GetNavigation = (modCode: string) => {
  //   let targetUrl = "/";
  const navigationMap: {
    [key: string]: { navUrl: string; apiUrl: string; apiUrlDel: string };
  } = {
    LedgerMast: {
      navUrl: "/masters/ledger",
      apiUrl: "api/ledger/fetch/Basedata",
      apiUrlDel: "api/ledger/del/",
    },
    ProdMast: {
      navUrl: "/masters/product",
      apiUrl: "api/product/fetch/Basedata",
      apiUrlDel: "api/product/del/",
    },
  };

  return navigationMap[modCode];
  // console.log(row.id);
  //   if (modCode === "LedgerMast") {
  //     return navigationMap[1];
  //   } else if (modCode === "ProdMast") {
  //     return navigationMap[2];
  //   } else {
  //     // Fallback page
  //     return (targetUrl = `/masters/basemaster`);
  //   }
};
