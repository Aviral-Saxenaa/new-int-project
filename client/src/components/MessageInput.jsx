import { useState } from 'react';

const MessageInput = ({
  onSend,
  onType,
  onBlur,
  disabled,
  placeholder = 'Type a message…',
}) => {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    onBlur?.();
  };

  return (
    <form className="message-input" onSubmit={submit}>
      <input
        className="message-input-field"
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value) {
            onType?.();
          } else {
            onBlur?.();
          }
        }}
        onBlur={onBlur}
        autoFocus
      />
      <button
        className="send-button"
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 11.5 21 3l-8.5 18-2.5-7.5L3 11.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;
