export const getAnyanomesId = () => {
  const cookieName = "anyanomesId";
  const cookieString = document.cookie;
  const cookieValue = cookieString
    .split(" ")
    .find((cookie) => {
      return cookie.startsWith(cookieName);
    })
    ?.split("=")[1];
  console.log("cookieValue", cookieValue);
  return cookieValue as string;
};
