import dayjs from "dayjs";
import pino from "pino";
import pinoPretty from "pino-pretty";

const stream = pinoPretty({
  colorize: true,
  ignore: "pid,hostname",
  customPrettifiers: {
    time: () => `[${dayjs().format()}]`,
  },
});

const logger = pino({
  level: "info",
  stream: stream,
});

export default logger;
