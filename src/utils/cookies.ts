export const getAnyanomesId = () => {
  const cookieName = "anyanomesId";
  const cookieString = document.cookie;
  const cookies = cookieString
    .split(";")
    .find((cookie) => {
      return cookie.startsWith(cookieName);
    })
    ?.split("=")[1];
  return cookies || null;
};
