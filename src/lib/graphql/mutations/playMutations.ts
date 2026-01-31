
export const CREATE_GAME_MUTATION = `
  mutation CreateGame($data: GameInput!) {
    createGame(data: $data) {
        variant
        timeControl
        color
        rated
    }
  }
` as string;

export interface CreateGameVariables {
  data: {
    variant: string;     
    timeControl: string;
    color: string;       
    rated: boolean;
  }
}