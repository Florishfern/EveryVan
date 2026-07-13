import React from 'react';

interface SeatMapProps {
  occupiedSeats: number[];
  selectedSeat: number | null;
  onSelectSeat: (seatNo: number) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ occupiedSeats, selectedSeat, onSelectSeat }) => {
  // Let's model a 13-seater van:
  // Front: Seat 1 (left), [Space], [Space], Driver (right, non-interactive)
  // Row 1: Seat 2 (left window), Seat 3 (middle), [Aisle], Seat 4 (right window)
  // Row 2: Seat 5 (left window), Seat 6 (middle), [Aisle], Seat 7 (right window)
  // Row 3: Seat 8 (left window), Seat 9 (middle), [Aisle], Seat 10 (right window)
  // Row 4: Seat 11 (left), Seat 12 (mid-left), Seat 13 (mid-right), Seat 14 (right)
  // Total passenger seats = 13 (numbered 1 to 13, let's maps to 1 to 13 indices)

  const rows = [
    // Front row: Left passenger (Seat 1), space, space, Driver
    [
      { id: 1, label: '01', type: 'seat' },
      { id: -1, label: '', type: 'empty' },
      { id: -1, label: '', type: 'empty' },
      { id: 0, label: '👨‍✈️ Driver', type: 'driver' }
    ],
    // Row 1
    [
      { id: 2, label: '02', type: 'seat' },
      { id: 3, label: '03', type: 'seat' },
      { id: -1, label: '', type: 'empty' },
      { id: 4, label: '04', type: 'seat' }
    ],
    // Row 2
    [
      { id: 5, label: '05', type: 'seat' },
      { id: 6, label: '06', type: 'seat' },
      { id: -1, label: '', type: 'empty' },
      { id: 7, label: '07', type: 'seat' }
    ],
    // Row 3
    [
      { id: 8, label: '08', type: 'seat' },
      { id: 9, label: '09', type: 'seat' },
      { id: -1, label: '', type: 'empty' },
      { id: 10, label: '10', type: 'seat' }
    ],
    // Row 4 (Back row has 4 seats, let's call them 11, 12, 13, and let's say Seat 13 is the 13th seat, making it 13 passenger seats in total)
    [
      { id: 11, label: '11', type: 'seat' },
      { id: 12, label: '12', type: 'seat' },
      { id: 13, label: '13', type: 'seat' },
      { id: 14, label: '14', type: 'seat' }
    ]
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '8px',
        width: '100%',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        🚐 หน้ารถ (Front of Van)
      </div>

      <div className="van-grid">
        {rows.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((item, colIndex) => {
              if (item.type === 'empty') {
                return <div key={`empty-${rowIndex}-${colIndex}`} style={{ width: '50px', height: '50px' }} />;
              }
              if (item.type === 'driver') {
                return (
                  <div key="driver-seat" className="seat seat-driver" style={{ fontSize: '10px' }}>
                    {item.label}
                  </div>
                );
              }

              const isOccupied = occupiedSeats.includes(item.id);
              const isSelected = selectedSeat === item.id;

              return (
                <button
                  key={`seat-${item.id}`}
                  disabled={isOccupied}
                  onClick={() => onSelectSeat(item.id)}
                  className={`seat ${
                    isSelected ? 'seat-selected' : isOccupied ? 'seat-occupied' : 'seat-available'
                  }`}
                  style={{ position: 'relative' }}
                  title={isOccupied ? 'ที่นั่งไม่ว่าง' : `เลือกที่นั่ง ${item.label}`}
                >
                  {item.label}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        fontWeight: 500,
        marginTop: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}></span>
          <span>ว่าง (Available)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--primary)' }}></span>
          <span>คุณเลือก (Selected)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#e2e8f0' }}></span>
          <span>ไม่ว่าง (Occupied)</span>
        </div>
      </div>
    </div>
  );
};
