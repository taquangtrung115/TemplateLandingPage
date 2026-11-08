import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButton from '../src/components/common/ActionButton';

describe('Astryx action buttons', () => {
  it.each([['primary', 'primary'], ['secondary', 'secondary'], ['success', 'success'], ['danger', 'destructive'], ['unknown', 'secondary']])('maps %s to a semantic Astryx variant', (actionType, variant) => {
    render(<ActionButton actionType={actionType} label="Lưu báo giá" />);
    expect(screen.getByRole('button', { name: 'Lưu báo giá' })).toHaveAttribute('data-variant', variant);
  });
  it('invokes an enabled action and preserves its form type', () => {
    const action = vi.fn();
    render(<ActionButton label="Lưu" type="submit" onClick={action} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
  it.each([{ disabled: true }, { loading: true }, { isDisabled: true }, { isLoading: true }])('blocks repeated actions while disabled/loading: %j', (props) => {
    const action = vi.fn();
    render(<ActionButton {...props} label="Lưu" onClick={action} />);
    const button = screen.getByRole('button', { name: 'Lưu' });
    if (props.loading || props.isLoading) expect(button).toHaveAttribute('aria-disabled', 'true');
    else expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(action).not.toHaveBeenCalled();
  });
  it('exposes a meaningful accessible name for an icon-only action', () => {
    render(<ActionButton isIconOnly icon={<span aria-hidden="true">×</span>} label="Xóa sản phẩm" />);
    expect(screen.getByRole('button', { name: 'Xóa sản phẩm' })).toBeInTheDocument();
  });
});
