import { io } from 'socket.io-client';

export interface SpotapiObject {
    now_playing?: SpotifyApi.CurrentlyPlayingObject,
    top_tracks?: SpotifyApi.UsersTopTracksResponse,
    top_artists?: SpotifyApi.UsersTopArtistsResponse
}

export const socket = io("https://spotify.josh.house", { path: "/ws"});