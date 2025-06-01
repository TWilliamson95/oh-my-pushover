import { ohMyGot } from "oh-my-got-so-simple";

export const enum Priority {
  LOWEST_PRIORITY = -2,
  LOW_PRIORITY = -1,
  NORMAL_PRIORITY = 0,
  HIGH_PRIORITY = 1,
  EMERGENCY = 2,
}

interface IUserConfig {
  user: string;
  token: string;
}

interface IExtraConfig {
  retry: 30 | 60 | 90 | 120; // seconds
  expire: 3600 | 7200 | 10800; // seconds
}

interface IPushoverClassConfig extends IUserConfig, IExtraConfig {}

type IPushoverConfig = Omit<IPushoverClassConfig, "retry" | "expire"> &
  Partial<Pick<IPushoverClassConfig, "retry" | "expire">>;

export interface IPushoverBody extends IUserConfig, IExtraConfig {
  message: string;
  priority: -2 | -1 | 0 | 1 | 2;
}

/**
 * Handles sending messages via the Pushover API. Supports priority, retry and expire configuration.
 */
export class PushoverHandler {
  private config: IPushoverClassConfig;

  /**
   * Creates an instance of `PushoverHandler`.
   *
   * @param config - Configuration object for the handler. Accepts a full config,
   *   with `retry` and `expire` being optional. Defaults are:
   *   - `retry`: 30 seconds
   *   - `expire`: 3600 seconds
   */
  constructor(config: IPushoverConfig) {
    this.config = {
      user: config.user,
      token: config.token,
      retry: config.retry ?? 30,
      expire: config.expire ?? 3600,
    };
  }

  /**
   * Sends a message via Pushover with the configured credentials and retry/expire options. Retry and expire options only considered for EMERGENCY priority
   *
   * @param message - The message body to send.
   * @param priority - The priority level of the message.
   * @param overrides - Optional overrides for `retry` and `expire` values for this particular call. If not provided, defaults used from either class default or values provided when instance was initialsed.
   *
   * @returns A promise that resolves when the message is sent.
   *
   * @remarks
   * Errors from the request are intentionally uncaught and should be handled by the caller.
   */
  sendMessage = async (
    message: string,
    priority: Priority,
    overrides?: IExtraConfig
  ) => {
    const body: IPushoverBody = {
      user: this.config.user,
      token: this.config.token,
      message,
      priority,
      retry: overrides?.retry ?? this.config.retry,
      expire: overrides?.expire ?? this.config.expire,
    };
    // any error is intentionally uncaught - errors should be handled by the caller
    return await ohMyGot().post("https://api.pushover.net/1/messages.json", {
      json: body,
      responseType: "json", // all Pushover API responses are JSON objects
    });
  };
}
