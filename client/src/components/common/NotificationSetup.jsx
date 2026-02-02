// import { requestNotificationPermission } from "@/utils/firebase";
// import toast from "react-hot-toast";
// import { useSelector } from "react-redux";

// export default function NotificationSetup() {
//   const { _id: userId } = useSelector((state) => state.auth.userProfile);

//   const handleEnableNotifications = async () => {
//     // This is now inside a click handler, so the browser will allow it
//     const token = await requestNotificationPermission(userId);

//     if (token) {
//       toast.success("Notifications enabled!");
//       console.log("Token generated:", token);
//     } else {
//       toast.error("Permission denied or failed.");
//     }
//   };

//   return (
//     <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
//       <h3 className="text-white font-medium mb-2">Stay Updated</h3>
//       <p className="text-sm text-neutral-400 mb-4">
//         Get real-time alerts when new documents are exchanged.
//       </p>
//       <button
//         onClick={() => handleEnableNotifications(userId)}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
//       >
//         Enable Push Notifications
//       </button>
//     </div>
//   );
// }