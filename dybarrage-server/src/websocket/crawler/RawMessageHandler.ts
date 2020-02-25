export default class RawMessageHandler {
  public static encode = (msg: string): Buffer => {
    const dataLen = msg.length + 9;
    const resLen = msg.length + 13;

    const resBytes = Buffer.alloc(resLen);
    
    const msgBytes = Buffer.from(msg);
    const dataLenBytes = Buffer.alloc(4);
    Buffer.from([dataLen]).copy(dataLenBytes, 0);
    const msgTypeBytes = Buffer.from([0xb1, 0x02, 0x00, 0x00]);
    const endBytes = Buffer.from([0x00]);

    dataLenBytes.copy(resBytes, 0);
    dataLenBytes.copy(resBytes, 4);
    msgTypeBytes.copy(resBytes, 8);
    msgBytes.copy(resBytes, 12);
    endBytes.copy(resBytes, 12 + msgBytes.length);

    return resBytes;
  }

  private static decode = (buf: Buffer): Array<string> => {
    let pos = 0;
    let msg: Array<string> = [];

    while(pos < buf.length) {
      const contentLen = buf.slice(pos, pos + 4).readInt32LE(0);
      const content = buf.slice(pos + 12, pos + 3 + contentLen).toString();
      msg.push(content);
      pos += (contentLen + 4);
    }

    return msg;
  }

  private static parseDecodeMsg = (decodeMsg: string): any => {
    const res: any = {};
    const attrs = decodeMsg.split('/');
    attrs.pop();

    attrs.forEach(attr => {
      attr = attr.replace('@S', '/').replace('@A', '@')
      const couple = attr.split('@=');
      res[couple[0]] = couple[1];
    });

    return res;
  }

  public static getMsgsObj = (buf: Buffer): Array<any> => {
    const decodeMsgs = RawMessageHandler.decode(buf);
    const res: Array<any> = [];

    decodeMsgs.forEach(decodeMsg => {
      const obj = RawMessageHandler.parseDecodeMsg(decodeMsg);
      if(obj.type === 'chatmsg') {
        res.push(obj);
      }
    });

    return res;
  }
}