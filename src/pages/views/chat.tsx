import React, { useContext, useEffect, useState, FormEvent } from "react";
import { UserContext } from "../../hooks/UserProvider";
import { UseUserIdContext } from "../../hooks/UserIdProvider";
import { useLocation } from "react-router-dom";
import { getUser } from "../../utils/user";

import {
  getPostMessages,
  postMessage,
  getSendMessages,
} from "../../utils/chat";

interface Message {
  sender_id: string;
  content: string;
  type: "sent" | "received";
}

export const Chat = () => {
  // const { receiverUserID, setReceiverUserID } = UseUserIdContext();
  // const { user } = useContext(UserContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const receiverUserID = queryParams.get("userID");

  const [content, setContent] = useState<string>("");
  const [sendUserID, setSendUserID] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 非同期関数を定義
    const fetchUser = async () => {
      const userData = await getUser();
      if (userData) {
        setSendUserID(userData.userId);
      }
    };

    fetchUser(); // マウント時にユーザデータを取得
  }, []); // 依存配列を空にすることでコンポーネントマウント時にのみ実行

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() === "") return;

    await postMessage({
      receiver_id: receiverUserID,
      sender_id: sendUserID,
      content,
    });
    setContent("");
    refreshMessages(); // 新しいメッセージを送信した後、メッセージリストを更新します
  };

  const refreshMessages = async () => {
    if (sendUserID) {
      const sentData = await getPostMessages({ user_id: sendUserID });
      const receivedData = await getSendMessages({ user_id: sendUserID });

      const formattedSent = sentData
        ? sentData.map((msg) => ({ ...msg, type: "sent" }))
        : [];
      const formattedReceived = receivedData
        ? receivedData.map((msg) => ({ ...msg, type: "received" }))
        : [];

      const allMessages = [
        ...formattedSent,
        ...formattedReceived,
      ].sort(/* ここでタイムスタンプに基づいてソートするロジックが必要 */);
      setMessages(allMessages);
    }
  };

  useEffect(() => {
    refreshMessages();
  }, [sendUserID]); // user.idが変更された場合にのみ再読み込み

  return (
    <div className="text-center">
      <div className="flex flex-col items-center w-full">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat ${
              msg.type === "sent" ? "chat-start" : "chat-end"
            } w-4/5 my-2`}
          >
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="mt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea textarea-bordered textarea-lg w-full max-w-xs"
        ></textarea>
        <button className="btn btn-neutral mt-2" type="submit">
          Send
        </button>
      </form>
    </div>
  );
};
