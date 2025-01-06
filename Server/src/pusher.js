import Pusher from "pusher";

const pusher = new Pusher({
    appId: "1888623",
    key: "a54ab26105acf3591692",
    secret: "e7d972482291b5706d72",
    cluster: "us2",
  });

export default pusher;