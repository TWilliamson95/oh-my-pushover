const gotPostFake = jest.fn().mockResolvedValue({});
const ohMyGotFuncFake = jest.fn();
// mock the entire ohMyGot module
jest.mock("oh-my-got-so-simple", () => ({
  ohMyGot: ohMyGotFuncFake, // Mock the ohMyGot function
}));

import { Priority, PushoverHandler } from "../../src/index";

describe("Send Message", () => {
  beforeEach(() => {
    ohMyGotFuncFake.mockImplementation(() => {
      return { post: gotPostFake } as any;
    });
  });

  const priorities = [
    Priority.LOWEST_PRIORITY,
    Priority.LOW_PRIORITY,
    Priority.NORMAL_PRIORITY,
    Priority.HIGH_PRIORITY,
    Priority.EMERGENCY,
  ];

  it.each(priorities)(
    `Priority: "$priority" - calls the correct endpoint with the correct message and correct config`,
    async (priority) => {
      const config = {
        user: "testUser",
        token: "testToken",
      };
      const pushoverHandler = new PushoverHandler(config);
      await pushoverHandler.sendMessage("testMessage", priority);

      expect(gotPostFake).toHaveBeenCalledTimes(1);
      expect(gotPostFake).toBeCalledWith(
        "https://api.pushover.net/1/messages.json",
        {
          json: {
            user: "testUser",
            token: "testToken",
            message: "testMessage",
            priority: priority,
            retry: 30,
            expire: 3600,
          },
        }
      );
    }
  );
  it("sets the retry and expire configs when provided on new instance", async () => {
    const config = {
      user: "testUser",
      token: "testToken",
      retry: 120 as const,
      expire: 10800 as const,
    };
    const pushoverHandler = new PushoverHandler(config);
    await pushoverHandler.sendMessage("testMessage", Priority.EMERGENCY);

    expect(gotPostFake).toHaveBeenCalledTimes(1);
    expect(gotPostFake).toBeCalledWith(
      "https://api.pushover.net/1/messages.json",
      {
        json: {
          user: "testUser",
          token: "testToken",
          message: "testMessage",
          priority: 2,
          retry: 120,
          expire: 10800,
        },
      }
    );
  });
  it("overrides the retry and expire configs when provided on call", async () => {
    const config = {
      user: "testUser",
      token: "testToken",
      retry: 120 as const,
      expire: 10800 as const,
    };
    const pushoverHandler = new PushoverHandler(config);
    await pushoverHandler.sendMessage("testMessage", Priority.EMERGENCY, {
      // provide new values, despite being set on initialisation
      retry: 90,
      expire: 7200,
    });

    expect(gotPostFake).toHaveBeenCalledTimes(1);
    expect(gotPostFake).toBeCalledWith(
      "https://api.pushover.net/1/messages.json",
      {
        json: {
          user: "testUser",
          token: "testToken",
          message: "testMessage",
          priority: 2,
          retry: 90,
          expire: 7200,
        },
      }
    );
  });
});
