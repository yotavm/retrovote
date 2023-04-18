export const getAnyanomesId = () => {
  const cookieName = "anyanomesId";
  const cookies = document.cookie
    .split(";")
    .find((cookie) => {
      return cookie.startsWith(cookieName);
    })
    ?.split("=")[1];
  return cookies || null;
};
