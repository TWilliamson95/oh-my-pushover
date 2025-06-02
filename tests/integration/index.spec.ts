import nock from "nock";
import { Priority, PushoverHandler } from "../../src";

// Disable all outgoing network connections
nock.disableNetConnect();

describe("Pushover Handler", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe("canCallApi method", () => {
    it("returns false when invalid credentials are provided", async () => {
      let callsToEndpoint = 0;
      let sentBody: any;
      nock("https://api.pushover.net")
        .post("/1/messages.json", (body) => {
          sentBody = body;
          return true;
        })
        .times(10) // stub for a max of 10 attempts
        .reply(200, () => {
          callsToEndpoint++;
          return {
            token: "invalid",
            errors: [
              "application token is invalid, see https://pushover.net/api",
            ],
            status: 0,
          };
        });

      const config = {
        user: "testUser",
        token: "testToken",
      };
      const pushoverHandler = new PushoverHandler(config);
      const response = await pushoverHandler.canCallApi();

      expect(callsToEndpoint).toEqual(1);
      expect(sentBody).toEqual({
        user: "testUser",
        token: "testToken",
        message: "Call to API test",
        priority: -2,
      });
      expect(response).toEqual(false);
    });
    it("returns true when valid credentials are provided", async () => {
      let callsToEndpoint = 0;
      let sentBody: any;
      nock("https://api.pushover.net")
        .post("/1/messages.json", (body) => {
          sentBody = body;
          return true;
        })
        .times(10) // stub for a max of 10 attempts
        .reply(200, () => {
          callsToEndpoint++;
          return {
            status: 1,
          };
        });

      const config = {
        user: "testUser",
        token: "testToken",
      };
      const pushoverHandler = new PushoverHandler(config);
      const response = await pushoverHandler.canCallApi();

      expect(callsToEndpoint).toEqual(1);
      expect(sentBody).toEqual({
        user: "testUser",
        token: "testToken",
        message: "Call to API test",
        priority: -2,
      });
      expect(response).toEqual(true);
    });
  });

  describe("sendMessage method", () => {
    it("calls the endpoint with the correct body and returns expected response", async () => {
      let callsToEndpoint = 0;
      let sentBody: any;
      nock("https://api.pushover.net")
        .post("/1/messages.json", (body) => {
          sentBody = body;
          return true;
        })
        .times(10) // stub for a max of 10 attempts
        .reply(200, () => {
          callsToEndpoint++;
          return {
            message: "successfully processed",
          };
        });

      const config = {
        user: "testUser",
        token: "testToken",
      };
      const pushoverHandler = new PushoverHandler(config);
      const response = await pushoverHandler.sendMessage(
        "testMessage",
        Priority.EMERGENCY
      );

      expect(callsToEndpoint).toEqual(1);
      expect(sentBody).toEqual({
        user: "testUser",
        token: "testToken",
        message: "testMessage",
        priority: 2,
        retry: 30,
        expire: 3600,
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        message: "successfully processed",
      });
    });
    // TODO: finish this when the function call can pass on ohMyGot params
    // and then for this test overwrite retry count and timeout
    // it("throws an error when endpoint returns !2xx", async () => {
    //   let callsToEndpoint = 0;
    //   let sentBody: any;
    //   nock("https://api.pushover.net")
    //     .post("/1/messages.json", (body) => {
    //       sentBody = body;
    //       return true;
    //     })
    //     .times(10) // stub for a max of 10 attempts
    //     .reply(200, () => {
    //       callsToEndpoint++;
    //     });

    //   const config = {
    //     user: "testUser",
    //     token: "testToken",
    //   };
    //   const pushoverHandler = new PushoverHandler(config);
    //   await pushoverHandler.sendMessage("testMessage", Priority.EMERGENCY);

    //   expect(callsToEndpoint).toEqual(1);
    //   expect(sentBody).toEqual({
    //     user: "testUser",
    //     token: "testToken",
    //     message: "testMessage",
    //     priority: 2,
    //     retry: 30,
    //     expire: 3600,
    //   });
    // });
  });
});
