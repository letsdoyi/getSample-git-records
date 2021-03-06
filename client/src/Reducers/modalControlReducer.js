export function modalControlReducer(state = false, action) {
  switch (action.type) {
    case 'READY_TO_SHOW_MODAL':
      return true;

    case 'NOT_READY_TO_SHOW_MODAL':
      return false;

    default:
      return state;
  }
}
export default modalControlReducer;
