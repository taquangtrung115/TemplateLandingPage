import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PencilSquareIcon, TrashIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import RowActions from '../src/components/common/RowActions';
import { Button } from '../src/components/common/Button';

const viewport = vi.hoisted(() => ({ compact: false }));
vi.mock('@astryxdesign/core/hooks', async () => ({ ...await vi.importActual('@astryxdesign/core/hooks'), useMediaQuery: () => viewport.compact }));
const actions = () => [
  { label: 'Xem', icon: EyeIcon, onClick: vi.fn() },
  { label: 'Sửa', icon: PencilSquareIcon, onClick: vi.fn() },
  { label: 'Tải', icon: ArrowDownTrayIcon, onClick: vi.fn() },
  { label: 'Xóa', icon: TrashIcon, destructive: true, isDisabled: true, onClick: vi.fn() },
];

describe.each([false, true])('Row actions, compact=%s', (compact) => {
  it.each([1, 2])('shows %s actions directly without an overflow control', (count) => {
    viewport.compact = compact;
    render(<RowActions label="bản ghi" actions={actions().slice(0, count)} />);
    expect(screen.getAllByRole('button')).toHaveLength(count);
    expect(screen.queryByRole('button', { name: /Thêm thao tác/ })).not.toBeInTheDocument();
  });
  it('keeps two direct buttons and puts only later actions in the third control', async () => {
    viewport.compact = compact;
    const options = actions();
    render(<RowActions label="bản ghi" actions={[false, ...options]} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Sửa', exact: true }));
    expect(options[1].onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Tải', exact: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm thao tác bản ghi' }));
    const download = await screen.findByRole(compact ? 'button' : 'menuitem', { name: 'Tải', exact: true });
    fireEvent.click(download);
    expect(options[2].onClick).toHaveBeenCalledOnce();
    expect(options[3].onClick).not.toHaveBeenCalled();
  });
});

it('uses a skeleton and blocks repeated submissions while a button is busy', () => {
  const click = vi.fn();
  render(<Button label="Lưu" isLoading onClick={click} />);
  const button = screen.getByRole('button', { name: 'Lưu' });
  expect(button).toBeDisabled(); expect(button).toHaveAttribute('aria-busy', 'true');
  expect(button.querySelector('svg')).toBeNull();
  fireEvent.click(button); expect(click).not.toHaveBeenCalled();
});
