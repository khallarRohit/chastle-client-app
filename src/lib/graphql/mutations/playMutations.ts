
export const CREATE_GAME_MUTATION = `
  mutation CreateGame($data: GameInput!) {
    createGame(data: $data) {
      game {
        id
      }
      wsToken
    }
  }
`;

