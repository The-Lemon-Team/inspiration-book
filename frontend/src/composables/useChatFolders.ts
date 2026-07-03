import { computed, ref } from 'vue';
import { useChatsStore } from '@/stores/chats';

export const ALL_CHATS_FOLDER_ID = 'all';

const selectedFolderId = ref(ALL_CHATS_FOLDER_ID);

export function useChatFolders() {
  const chats = useChatsStore();

  type FolderTab = {
    id: string;
    label: string;
    title: string;
    icon: string;
    initial?: string;
    color?: string;
  };

  const folderTabs = computed<FolderTab[]>(() => {
    const sortedCollections = [...chats.collections].sort((a, b) => {
      const aTs = new Date(a.lastMessageAt ?? a.createdAt ?? 0).getTime();
      const bTs = new Date(b.lastMessageAt ?? b.createdAt ?? 0).getTime();
      return bTs - aTs;
    });

    return [
      {
        id: ALL_CHATS_FOLDER_ID,
        label: 'All',
        title: 'All chats',
        icon: 'forum',
      },
      ...sortedCollections.map((collection) => ({
        id: collection.id,
        label: collectionInitial(collection.name),
        title: collection.name,
        icon: 'folder',
        initial: collectionInitial(collection.name),
        color: folderColor(collection.name),
      })),
    ];
  });

  const activeFolder = computed(
    () =>
      folderTabs.value.find((folder) => folder.id === selectedFolderId.value) ??
      folderTabs.value[0],
  );

  const isAllChatsFolder = computed(
    () => selectedFolderId.value === ALL_CHATS_FOLDER_ID,
  );

  function selectFolder(folderId: string) {
    selectedFolderId.value = folderId;
  }

  return {
    selectedFolderId,
    folderTabs,
    activeFolder,
    isAllChatsFolder,
    selectFolder,
  };
}

function collectionInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function folderColor(name: string) {
  const colors = ['#5b8def', '#e85d75', '#45b7a8', '#f0a030', '#9b7cf8', '#22c55e', '#f472b6'];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
