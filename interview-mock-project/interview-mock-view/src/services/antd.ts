import type { MessageInstance } from "antd/es/message/interface";

let messageInstance: MessageInstance | null = null;

export function registerMessage(instance: MessageInstance) {
  messageInstance = instance;
}

export const message = {
  success(content: string) {
    return messageInstance?.success(content);
  },

  error(content: string) {
    return messageInstance?.error(content);
  },

  warning(content: string) {
    return messageInstance?.warning(content);
  },

  info(content: string) {
    return messageInstance?.info(content);
  },
};
