import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
    *,
    *::after,
    *::before {
        box-sizing: border-box;
    }
    
    html,
    body,
    #root {
        min-height: 100%;
    }

    body {
        --bs-body-bg: ${({ theme }) => theme.body};
        --bs-body-color: ${({ theme }) => theme.text};
        --bs-secondary-color: ${({ theme }) => theme.secondaryText};
        --bs-secondary-bg: ${({ theme }) => theme.surface};
        --bs-tertiary-bg: ${({ theme }) => theme.surface};
        --bs-border-color: ${({ theme }) => theme.border};
        --bs-card-bg: ${({ theme }) => theme.surface};
        --bs-card-color: ${({ theme }) => theme.text};
        --bs-card-border-color: ${({ theme }) => theme.border};
        --bs-list-group-bg: ${({ theme }) => theme.surface};
        --bs-list-group-color: ${({ theme }) => theme.text};
        --bs-list-group-border-color: ${({ theme }) => theme.border};
        --bs-modal-bg: ${({ theme }) => theme.surface};
        --bs-modal-color: ${({ theme }) => theme.text};
        background-color: ${({ theme }) => theme.body};
        color: ${({ theme }) => theme.text};
        color-scheme: ${({ theme }) => theme.mode};
        transition: background-color 0.25s linear, color 0.25s linear;
    }

    .card,
    .list-group-item,
    .modal-content {
        background-color: ${({ theme }) => theme.surface};
        color: ${({ theme }) => theme.text};
        border-color: ${({ theme }) => theme.border};
    }

    .modal-header,
    .modal-footer {
        border-color: ${({ theme }) => theme.border};
    }

    .form-control,
    .form-select {
        background-color: ${({ theme }) => theme.surface};
        color: ${({ theme }) => theme.text};
        border-color: ${({ theme }) => theme.border};
    }

    .form-control::placeholder {
        color: ${({ theme }) => theme.text};
        opacity: 0.65;
    }

    footer {
        color: ${({ theme }) => theme.text};
        background-color: ${({ theme }) => theme.surface};
        border-top: 1px solid ${({ theme }) => theme.border};
    }

    footer a {
        color: inherit;
    }

    .summary-bottom-panel {
        background-color: ${({ theme }) => theme.surface};
        border-color: ${({ theme }) => theme.border} !important;
    }
    `;