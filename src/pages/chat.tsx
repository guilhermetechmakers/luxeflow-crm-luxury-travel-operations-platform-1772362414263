/**
 * Team Chat - Internal collaboration hub with channels, DMs, message linking
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Search, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ChannelList,
  DirectMessageList,
  ChannelHeader,
  MessageList,
  MessageComposer,
  AttachmentUploader,
  LinkContextPicker,
  TaskFromMessageModal,
  NoteFromMessageModal,
  SearchPanel,
  ChannelInfoPanel,
} from '@/components/team-chat'
import {
  useChannels,
  useMessages,
  usePinnedMessages,
  useSendMessage,
  useChatUsers,
  useCreateTaskFromMessage,
  useConvertToNote,
  useTogglePinMessage,
} from '@/hooks/use-chat'
import { chatApi } from '@/api/chat'
import type { Channel, ChatMessage, ChatUser } from '@/types/chat'

const CURRENT_USER: ChatUser = { id: 'a1', name: 'Sarah Mitchell', avatarUrl: null, role: 'agent' }

export function Chat() {
  const navigate = useNavigate()
  const [currentChannelId, setCurrentChannelId] = useState<string | null>('ch1')
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [linkContext, setLinkContext] = useState<{ bookingId?: string; clientId?: string }>({})
  const [taskModalMessage, setTaskModalMessage] = useState<ChatMessage | null>(null)
  const [noteModalMessage, setNoteModalMessage] = useState<ChatMessage | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showAttachDrawer, setShowAttachDrawer] = useState(false)

  const { data: channelsData } = useChannels()
  const { data: usersData } = useChatUsers()
  const channels = (channelsData?.data ?? []) as Channel[]
  const allUsers = Array.isArray(usersData) ? usersData : ([] as ChatUser[])
  const { data: messagesData } = useMessages(currentChannelId)
  const messages = (messagesData?.data ?? []) as ChatMessage[]
  const { data: pinnedMessages = [] } = usePinnedMessages(currentChannelId)
  const sendMessage = useSendMessage()
  const createTask = useCreateTaskFromMessage()
  const convertToNote = useConvertToNote()
  const togglePin = useTogglePinMessage()

  const memberIds = (currentChannelId ? (channels ?? []).find((c) => c.id === currentChannelId)?.memberIds ?? [] : []) as string[]
  const members: ChatUser[] = memberIds.map((id) => {
    const u = (allUsers ?? []).find((x) => x.id === id)
    return u ?? { id, name: id }
  })

  const currentChannel = (channels ?? []).find((c) => c.id === currentChannelId) ?? null

  const handleMentionQuery = useCallback(async (query: string) => {
    return chatApi.searchUsers(query)
  }, [])

  const handleSend = useCallback(
    (content: string, opts?: { linkedBookingId?: string; linkedClientId?: string; mentions?: string[] }) => {
      if (!currentChannelId) return
      sendMessage.mutate(
        {
          channelId: currentChannelId,
          content,
          linkedBookingId: opts?.linkedBookingId,
          linkedClientId: opts?.linkedClientId,
          mentions: opts?.mentions,
        },
        {
          onSuccess: () => toast.success('Message sent'),
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to send'),
        }
      )
    },
    [currentChannelId, sendMessage]
  )

  const handleSelectBooking = useCallback((b: { id: string }) => {
    setLinkContext((prev) => ({ ...prev, bookingId: b.id }))
    setShowLinkPicker(false)
  }, [])

  const handleSelectClient = useCallback((c: { id: string }) => {
    setLinkContext((prev) => ({ ...prev, clientId: c.id }))
    setShowLinkPicker(false)
  }, [])

  const handleSearchExecute = useCallback(async (q: string, scope?: 'messages' | 'attachments' | 'linked') => {
    setSearchLoading(true)
    try {
      const res = await chatApi.searchMessages(q, scope)
      setSearchResults(res ?? [])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleCreateTask = useCallback(
    (message: ChatMessage) => {
      setTaskModalMessage(message)
    },
    []
  )

  const handleTaskSubmit = useCallback(
    (payload: Parameters<typeof createTask.mutateAsync>[0]['payload']) => {
      if (!taskModalMessage) return
      createTask.mutate(
        { messageId: taskModalMessage.id, payload },
        {
          onSuccess: () => {
            toast.success('Task created')
            setTaskModalMessage(null)
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to create task'),
        }
      )
    },
    [taskModalMessage, createTask]
  )

  const handleConvertToNote = useCallback(
    (message: ChatMessage) => {
      setNoteModalMessage(message)
    },
    []
  )

  const handleNoteSubmit = useCallback(
    (content: string) => {
      if (!noteModalMessage) return
      convertToNote.mutate(
        { messageId: noteModalMessage.id, content },
        {
          onSuccess: () => {
            toast.success('Note created')
            setNoteModalMessage(null)
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to create note'),
        }
      )
    },
    [noteModalMessage, convertToNote]
  )

  const handleCopyLink = useCallback((message: ChatMessage) => {
    const url = `${window.location.origin}/dashboard/chat?message=${message.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }, [])

  const handleLinkClick = useCallback(
    (type: 'booking' | 'client', id: string) => {
      if (type === 'booking') navigate(`/dashboard/bookings/${id}`)
      else navigate(`/dashboard/clients/${id}`)
    },
    [navigate]
  )

  const handlePinToggle = useCallback(
    (message: ChatMessage) => {
      if (!currentChannelId) return
      togglePin.mutate({
        channelId: currentChannelId,
        messageId: message.id,
        pinned: !message.pinned,
      })
    },
    [currentChannelId, togglePin]
  )

  const handleCreateChannel = useCallback(() => {
    toast.info('Create channel – coming soon')
  }, [])

  const uniqueUsers = allUsers

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-fade-in">
      {/* Left sidebar: Channels + DMs */}
      <Card className="w-64 shrink-0 flex flex-col overflow-hidden">
        <Tabs defaultValue="channels" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-2 mt-2 shrink-0">
            <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
            <TabsTrigger value="dms" className="flex-1">DMs</TabsTrigger>
          </TabsList>
          <TabsContent value="channels" className="flex-1 min-h-0 mt-0">
            <ChannelList
              channels={channels}
              currentChannelId={currentChannelId}
              onSelectChannel={(ch) => setCurrentChannelId(ch.id)}
              onCreateChannel={handleCreateChannel}
            />
          </TabsContent>
          <TabsContent value="dms" className="flex-1 min-h-0 mt-0">
            <DirectMessageList
              channels={channels}
              users={uniqueUsers}
              currentChannelId={currentChannelId}
              currentUserId={CURRENT_USER.id}
              onSelectChannel={(ch) => setCurrentChannelId(ch.id)}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Main chat area */}
      <Card className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <ChannelHeader
          channel={currentChannel}
          members={members}
          pinnedCount={(pinnedMessages ?? []).length}
          onOpenInfo={() => setShowInfoPanel(true)}
        />
        <MessageList
          messages={messages}
          currentUser={CURRENT_USER}
          users={members}
          onLinkClick={handleLinkClick}
          onCreateTask={handleCreateTask}
          onCopyLink={handleCopyLink}
          onConvertToNote={handleConvertToNote}
          onPinToggle={handlePinToggle}
        />
        <MessageComposer
          channelId={currentChannelId}
          onSend={handleSend}
          onAttach={() => setShowAttachDrawer(true)}
          onMentionQuery={handleMentionQuery}
          onLinkToBookingClient={() => setShowLinkPicker(true)}
          linkContext={linkContext}
          onClearLink={() => setLinkContext({})}
          isSending={sendMessage.isPending}
        />
      </Card>

      {/* Right: Search panel + action buttons */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex gap-2">
          <Popover open={showLinkPicker} onOpenChange={setShowLinkPicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Link to booking or client">
                <Link2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0">
              <LinkContextPicker
                searchTerm=""
                onSelectBooking={handleSelectBooking}
                onSelectClient={handleSelectClient}
                onClose={() => setShowLinkPicker(false)}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant={showSearchPanel ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {showSearchPanel && (
          <Card className="w-80 flex flex-col overflow-hidden flex-1 min-h-0">
            <SearchPanel
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSearchExecute={handleSearchExecute}
              results={searchResults}
              isLoading={searchLoading}
            />
          </Card>
        )}
      </div>

      <Sheet open={showInfoPanel} onOpenChange={setShowInfoPanel}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Channel Info</SheetTitle>
          </SheetHeader>
          <ChannelInfoPanel
            channel={currentChannel}
            pinnedMessages={pinnedMessages ?? []}
            members={members}
            onPinToggle={handlePinToggle}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={showAttachDrawer} onOpenChange={setShowAttachDrawer}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Attach files</SheetTitle>
          </SheetHeader>
          <AttachmentUploader
            onUpload={(files) => {
              toast.info(`Selected ${files.length} file(s) – upload in composer coming soon`)
              setShowAttachDrawer(false)
            }}
          />
        </SheetContent>
      </Sheet>

      <TaskFromMessageModal
        open={!!taskModalMessage}
        onOpenChange={(open) => !open && setTaskModalMessage(null)}
        relatedMessage={taskModalMessage}
        onCreateTask={handleTaskSubmit}
        isCreating={createTask.isPending}
      />

      <NoteFromMessageModal
        open={!!noteModalMessage}
        onOpenChange={(open) => !open && setNoteModalMessage(null)}
        relatedMessage={noteModalMessage}
        onCreateNote={handleNoteSubmit}
        isCreating={convertToNote.isPending}
      />
    </div>
  )
}
