export interface LiveStream {
  _id: string;
  thumbnail: string;
  title: string;
  description: string;
  totalViews?: number;
}

export interface LiveStreamListResponse {
  status: boolean;
  message: string;
  list: LiveStream[];
  total: number;
  socketEvent: string;
}

export interface ProgramRecurrence {
  frequency: string;
  interval: number;
  count?: number;
}

export interface Program {
  _id: string;
  streamId?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  recurring?: boolean;
  recurrence?: ProgramRecurrence;
  channelName?: string;
  channelThumbnail?: string;
  streamIcon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StreamDetails {
  _id: string;
  channelId?: string | null;
  streamType: string;
  streamURL: string;
  channelName: string;
  description?: string;
  thumbnail?: string;
  streamIcon?: string;
  tvChannels?: string[];
  category?: string;
  genres?: string[];
  muxLiveStreamId?: string;
  muxPlaybackId?: string;
  muxStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StreamDetailsResponse {
  status: boolean;
  message: string;
  stream: StreamDetails | null;
  selectedDate?: string;
  totalViews?: number;
  socketEvent: string;
  socketRoom: string;
}

export interface StreamDetailsSocketPayload {
  stream: StreamDetails | null;
  totalViews?: number;
  selectedDate?: string;
  // The doc warns these may still ride the socket payload until the
  // websocket layer is aligned — accept but ignore for schedule UI.
  programs?: Program[];
  dates?: string[];
}

export interface StreamViewResponse {
  status: boolean;
  message: string;
  streamId: string;
  totalViews: number;
}

export interface ProgramGuideRow {
  streamId: string;
  channelName: string;
  channelThumbnail?: string;
  streamIcon?: string;
  programs: Program[];
}

export interface ProgramGuidePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProgramGuideSocketInfo {
  event: string;
  room: string;
  subscribeEvent: string;
  unsubscribeEvent: string;
  subscribePayload: { programDate: string };
}

export interface ProgramGuideResponse {
  status: boolean;
  message: string;
  selectedDate: string;
  dates: string[];
  programs: {
    currentStream: ProgramGuideRow;
    otherStreams: ProgramGuideRow[];
  };
  pagination: ProgramGuidePagination;
  socket: ProgramGuideSocketInfo;
}
