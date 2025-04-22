export const isResponseValid = (response) => {
  if (!response.status.toString().startsWith('2')) {
    throw new Error(
      `Ошибка: ${response.status} - ${response.body.message || response.text}`,
    );
  }
};

export const isResponseUnvalid = (response) => {
  if (!response.status.toString().startsWith('4')) {
    throw new Error(
      `Ошибка: ${response.status} - ${response.body.message || response.text}`,
    );
  }
};

export const generateTestUserId = () => {
  const min = 10000;
  const max = 99999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};
