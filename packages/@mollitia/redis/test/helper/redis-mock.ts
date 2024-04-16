let mockGetDelay = 0;
let mockSetDelay = 0;
let redisCrash = false;

export const setRedisOptions = (config: { getDelay?: number, setDelay?: number, crash?: boolean }) => {
  mockGetDelay = config.getDelay || 0;
  mockSetDelay = config.setDelay || 0;
  redisCrash = config.crash || false;
}

const delay = (delay = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

export const redisMock = {
  createClient: () => {
    const keyValuesCollection: { key: string, value: string }[] = [];
    return {
      on: (): Promise<void> | void => {
        return;
      },
      connect: () => {
        return;
      },
      keys: async (keyPrefix: string): Promise<string[]> => {
        return new Promise((resolve) => {
          const keyPrefixAdjusted = keyPrefix.replaceAll('*', '');
          const matchingKeys = keyValuesCollection.reduce(
            (acc: string[], current) => {
              if (current.key && current.key.indexOf(keyPrefixAdjusted) === 0) {
                acc.push(current.key);
              }
              return acc;
            }, []
          );
          resolve(matchingKeys);
        });
      },
      get: async (key: string): Promise<string | null> => {
        if (redisCrash) {
          throw ('Redis Error');
        }
        if (mockGetDelay) {
          await(mockGetDelay);
        }
        return new Promise((resolve) => {
          const elem = keyValuesCollection.find((elem) => elem.key === key);
          resolve(elem?.value || null);
        });
      },
      set: async (key: string, value: string): Promise<void> => {
        if (redisCrash) {
          throw ('Redis Error');
        }
        if (mockSetDelay) {
          await delay(mockSetDelay);
        }
        return new Promise((resolve) => {
          const elem = keyValuesCollection.find((elem) => elem.key === key);
          if (!elem) {
            keyValuesCollection.push({ key, value });
          } else {
            elem.value = value;
          }
          resolve();
        });
      },
      del: async (key: string): Promise<void> => {
        return new Promise((resolve) => {
          const elemIndex = keyValuesCollection.findIndex((elem) => elem.key === key);
          if (elemIndex > -1) {
            keyValuesCollection.splice(elemIndex, 1);
          }
          resolve();
        });
      },
      expire: async (key: string, delay: number): Promise<void> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const elemIndex = keyValuesCollection.findIndex((elem) => elem.key === key);
            if (elemIndex > -1) {
              keyValuesCollection.splice(elemIndex, 1);
            }
            resolve();
          }, delay * 1000)
        });
      }
    }
  }
};
