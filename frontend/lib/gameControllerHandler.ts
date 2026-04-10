/**
 * Game Controller Handler
 * Maps gamepads/controllers to emulator input
 */

export interface GamepadInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  x?: boolean;
  y?: boolean;
  start: boolean;
  select: boolean;
  l?: boolean;
  r?: boolean;
}

const GAMEPAD_BUTTON_MAP = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  HOME: 16,
};

const GAMEPAD_AXIS_MAP = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
  LEFT_TRIGGER: 4,
  RIGHT_TRIGGER: 5,
};

export class GameControllerHandler {
  private gamepadIndex: number = -1;
  private inputState: GamepadInputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    x: false,
    y: false,
    start: false,
    select: false,
    l: false,
    r: false,
  };
  private pollInterval: number | null = null;
  private onInputChange: ((state: GamepadInputState) => void) | null = null;
  private keyboardState: Partial<GamepadInputState> = {};

  constructor(onInputChange?: (state: GamepadInputState) => void) {
    this.onInputChange = onInputChange || null;
    this.setupKeyboardInput();
  }

  /**
   * Setup keyboard input handlers
   */
  private setupKeyboardInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // WASD or Arrow keys for movement
      if (['ArrowUp', 'w', 'W'].includes(key)) this.keyboardState.up = true;
      if (['ArrowDown', 's', 'S'].includes(key)) this.keyboardState.down = true;
      if (['ArrowLeft', 'a', 'A'].includes(key)) this.keyboardState.left = true;
      if (['ArrowRight', 'd', 'D'].includes(key)) this.keyboardState.right = true;

      // Buttons
      if (['z', 'Z'].includes(key)) this.keyboardState.a = true;
      if (['x', 'X'].includes(key)) this.keyboardState.b = true;
      if (['q', 'Q'].includes(key)) this.keyboardState.l = true;
      if (['e', 'E'].includes(key)) this.keyboardState.r = true;
      if (key === 'Enter') this.keyboardState.start = true;
      if (key === 'Shift') this.keyboardState.select = true;

      this.notifyInputChange();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;

      if (['ArrowUp', 'w', 'W'].includes(key)) this.keyboardState.up = false;
      if (['ArrowDown', 's', 'S'].includes(key)) this.keyboardState.down = false;
      if (['ArrowLeft', 'a', 'A'].includes(key)) this.keyboardState.left = false;
      if (['ArrowRight', 'd', 'D'].includes(key)) this.keyboardState.right = false;

      if (['z', 'Z'].includes(key)) this.keyboardState.a = false;
      if (['x', 'X'].includes(key)) this.keyboardState.b = false;
      if (['q', 'Q'].includes(key)) this.keyboardState.l = false;
      if (['e', 'E'].includes(key)) this.keyboardState.r = false;
      if (key === 'Enter') this.keyboardState.start = false;
      if (key === 'Shift') this.keyboardState.select = false;

      this.notifyInputChange();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  /**
   * Start polling gamepad input
   */
  startPolling(interval: number = 16): void {
    // 16ms = ~60 FPS
    this.pollInterval = window.setInterval(() => {
      this.pollGamepad();
    }, interval);
  }

  /**
   * Stop polling gamepad input
   */
  stopPolling(): void {
    if (this.pollInterval !== null) {
      window.clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Detect connected gamepad
   */
  detectGamepad(): boolean {
    const gamepads = navigator.getGamepads?.();

    if (!gamepads) {
      return false;
    }

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i;
        return true;
      }
    }

    return false;
  }

  /**
   * Poll gamepad state
   */
  private pollGamepad(): void {
    if (this.gamepadIndex === -1) {
      this.detectGamepad();
      if (this.gamepadIndex === -1) {
        return;
      }
    }

    const gamepads = navigator.getGamepads?.();
    if (!gamepads || !gamepads[this.gamepadIndex]) {
      this.gamepadIndex = -1;
      return;
    }

    const gamepad = gamepads[this.gamepadIndex];
    if (gamepad) {
      this.updateInputState(gamepad);
    }
  }

  /**
   * Update input state from gamepad
   */
  private updateInputState(gamepad: Gamepad): void {
    const oldState = { ...this.inputState };

    // D-Pad and buttons
    this.inputState.up = gamepad.buttons[GAMEPAD_BUTTON_MAP.UP]?.pressed || this.keyboardState.up || false;
    this.inputState.down = gamepad.buttons[GAMEPAD_BUTTON_MAP.DOWN]?.pressed || this.keyboardState.down || false;
    this.inputState.left = gamepad.buttons[GAMEPAD_BUTTON_MAP.LEFT]?.pressed || this.keyboardState.left || false;
    this.inputState.right = gamepad.buttons[GAMEPAD_BUTTON_MAP.RIGHT]?.pressed || this.keyboardState.right || false;

    // Face buttons
    this.inputState.a = gamepad.buttons[GAMEPAD_BUTTON_MAP.A]?.pressed || this.keyboardState.a || false;
    this.inputState.b = gamepad.buttons[GAMEPAD_BUTTON_MAP.B]?.pressed || this.keyboardState.b || false;
    this.inputState.x = gamepad.buttons[GAMEPAD_BUTTON_MAP.X]?.pressed || false;
    this.inputState.y = gamepad.buttons[GAMEPAD_BUTTON_MAP.Y]?.pressed || false;

    // Shoulder buttons
    this.inputState.l = gamepad.buttons[GAMEPAD_BUTTON_MAP.LB]?.pressed || this.keyboardState.l || false;
    this.inputState.r = gamepad.buttons[GAMEPAD_BUTTON_MAP.RB]?.pressed || this.keyboardState.r || false;

    // Special buttons
    this.inputState.start = gamepad.buttons[GAMEPAD_BUTTON_MAP.START]?.pressed || this.keyboardState.start || false;
    this.inputState.select = gamepad.buttons[GAMEPAD_BUTTON_MAP.BACK]?.pressed || this.keyboardState.select || false;

    // Check if state changed
    if (JSON.stringify(oldState) !== JSON.stringify(this.inputState)) {
      this.notifyInputChange();
    }
  }

  /**
   * Notify input change
   */
  private notifyInputChange(): void {
    if (this.onInputChange) {
      this.onInputChange({ ...this.inputState });
    }
  }

  /**
   * Get current input state
   */
  getInputState(): GamepadInputState {
    return { ...this.inputState };
  }

  /**
   * Is gamepad connected
   */
  isConnected(): boolean {
    return this.gamepadIndex !== -1;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopPolling();
  }
}
