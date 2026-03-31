import ChatScreen from "@/components/chat/ChatScreen";
import { useLocalSearchParams } from "expo-router";

export default function BrandChat() {
  const { user: initialUserId, campaign: initialCampaignId } = useLocalSearchParams<{ user: string; campaign: string }>();
  return <ChatScreen role="brand" initialUserId={initialUserId} initialCampaignId={initialCampaignId} />;
}