function stringifyLog(level, message, context, metadata) {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...context,
    ...metadata,
  });
}

/**
 * @param {Record<string, unknown>} [baseContext]
 */
export function createLogger(baseContext = {}) {
  const write = (level, message, metadata = {}) => {
    const line = stringifyLog(level, message, baseContext, metadata);

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  };

  return {
    info(message, metadata = {}) {
      write("info", message, metadata);
    },
    warn(message, metadata = {}) {
      write("warn", message, metadata);
    },
    error(message, metadata = {}) {
      write("error", message, metadata);
    },
    child(extraContext = {}) {
      return createLogger({ ...baseContext, ...extraContext });
    },
  };
}

