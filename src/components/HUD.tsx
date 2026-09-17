import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { TrackMap } from './TrackMap'
import React from 'react'

export const HUD = React.memo(() => {
  const elapsedTime = useGameStore(
    (state: any) => state.elapsedTime
  )

  const currentLap = useGameStore(
    (state: any) => state.currentLap
  )

  const totalLaps = useGameStore(
    (state: any) => state.totalLaps
  )

  const [displaySpeed, setDisplaySpeed] =
    useState(240)

  const [rpm, setRpm] = useState(6500)

  const [gear, setGear] = useState(5)

  const [position, setPosition] =
    useState(
      Math.floor(Math.random() * 8) + 3
    )

  const [delta, setDelta] =
    useState('+0.452')

  const [sector, setSector] =
    useState(1)

  const [fuel, setFuel] =
    useState(100)

  const [lives, setLives] =
    useState(3)

  // SPEED + POSITION + DELTA
  useEffect(() => {
    const interval = setInterval(() => {
      const base =
        240 +
        Math.sin(Date.now() * 0.0015) * 65

      const variation =
        Math.random() * 24

      const target =
        base + variation

      setDisplaySpeed((prev) => {
        const diff = target - prev
        return prev + diff * 0.06
      })

      setPosition((prev) => {
        const move = Math.random()

        if (move > 0.84 && prev > 1) {
          return prev - 1
        }

        if (move < 0.16 && prev < 12) {
          return prev + 1
        }

        return prev
      })

      setSector((prev) =>
        prev >= 3 ? 1 : prev + 1
      )

      const randomDelta =
        (
          Math.random() * 1.4 -
          0.7
        ).toFixed(3)

      setDelta(
        `${
          Number(randomDelta) > 0
            ? '+'
            : ''
        }${randomDelta}`
      )
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  // FUEL DRAIN
  useEffect(() => {
    const interval = setInterval(() => {
      setFuel((prev) =>
        Math.max(0, prev - 0.12)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // RPM + GEAR
  useEffect(() => {
    const newRpm =
      3000 +
      (displaySpeed / 380) * 8500

    setRpm(Math.round(newRpm))

    const newGear =
      displaySpeed < 80
        ? 2
        : displaySpeed < 130
        ? 3
        : displaySpeed < 180
        ? 4
        : displaySpeed < 240
        ? 5
        : displaySpeed < 300
        ? 6
        : 7

    setGear(newGear)
  }, [displaySpeed])

  const formatTime = (
    seconds: number
  ) => {
    const mins = Math.floor(
      seconds / 60
    )

    const secs = Math.floor(
      seconds % 60
    )

    const ms = Math.floor(
      (seconds % 1) * 1000
    )

    return `${mins}:${secs
      .toString()
      .padStart(
        2,
        '0'
      )}.${ms
      .toString()
      .padStart(3, '0')}`
  }

  const glassStyle = {
    background:
      'rgba(10,10,15,0.34)',

    backdropFilter: 'blur(16px)',

    border:
      '1px solid rgba(255,255,255,0.08)',

    boxShadow:
      '0 0 24px rgba(0,0,0,0.32)',
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* POSITION */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',

          width: '190px',

          borderRadius: '22px',

          padding: '16px',

          color: 'white',

          ...glassStyle,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.35em',
            opacity: 0.55,
            marginBottom: '10px',
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          POSITION
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          {position}

          <span
            style={{
              fontSize: '18px',
              opacity: 0.45,
              marginLeft: '6px',
            }}
          >
            /12
          </span>
        </div>

        {/* LAP */}
        <div
          style={{
            marginTop: '22px',
            fontSize: '11px',
            letterSpacing: '0.35em',
            opacity: 0.55,
            marginBottom: '10px',
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          LAP
        </div>

        <div
          style={{
            fontSize: '30px',
            fontWeight: 700,
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          {currentLap}

          <span
            style={{
              fontSize: '16px',
              opacity: 0.45,
              marginLeft: '6px',
            }}
          >
            /{totalLaps}
          </span>
        </div>
      </div>

      {/* LEADERBOARD */}
      <div
        style={{
          position: 'fixed',
          left: '24px',
          top: '300px',

          width: '220px',

          borderRadius: '22px',

          padding: '14px',

          color: 'white',

          ...glassStyle,
        }}
      >
        {[
          'VER',
          'NOR',
          'LEC',
          'HAM',
          'YOU',
          'ALO',
          'RUS',
          'PIA',
        ].map((driver, i) => (
          <div
            key={driver}
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              marginBottom: '6px',
              borderRadius: '10px',

              background:
                driver === 'YOU'
                  ? 'rgba(0,255,157,0.12)'
                  : 'transparent',

              border:
                driver === 'YOU'
                  ? '1px solid rgba(0,255,157,0.25)'
                  : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  opacity: 0.45,
                  width: '18px',
                }}
              >
                {i + 1}
              </span>

              <span
                style={{
                  fontFamily:
                    'Orbitron, sans-serif',
                  fontSize: '13px',
                }}
              >
                {driver}
              </span>
            </div>

            <span
              style={{
                color:
                  driver === 'YOU'
                    ? '#00FF9D'
                    : 'rgba(255,255,255,0.4)',

                fontSize: '11px',
              }}
            >
              +
              {(
                Math.random() * 2
              ).toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      {/* TIMER */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform:
            'translateX(-50%)',

          padding: '12px 26px',

          borderRadius: '18px',

          color: 'white',

          ...glassStyle,
        }}
      >
        <div
          style={{
            fontSize: '30px',
            fontFamily:
              'Orbitron, sans-serif',
            textAlign: 'center',
          }}
        >
          {formatTime(elapsedTime)}
        </div>

        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            justifyContent:
              'center',
            gap: '12px',
            fontSize: '11px',
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          {['S1', 'S2', 'S3'].map(
            (s, i) => (
              <span
                key={s}
                style={{
                  color:
                    sector === i + 1
                      ? '#00FF9D'
                      : 'rgba(255,255,255,0.35)',

                  textShadow:
                    sector === i + 1
                      ? '0 0 10px #00FF9D'
                      : 'none',
                }}
              >
                {s}
              </span>
            )
          )}

          <span
            style={{
              marginLeft: '10px',

              color:
                delta.includes('-')
                  ? '#00FF9D'
                  : '#FF3366',
            }}
          >
            {delta}
          </span>
        </div>
      </div>

      {/* TRACK MAP */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',

          width: '290px',
          height: '290px',

          borderRadius: '24px',

          padding: '18px',

          color: 'white',

          ...glassStyle,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.35em',
            opacity: 0.55,
            marginBottom: '14px',
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          TRACK MAP
        </div>

        <TrackMap />
      </div>

      {/* SPEEDOMETER */}
      <div
        style={{
          position: 'fixed',
          bottom: '60px',
          left: '80%',
          transform:
            'translateX(-50%)',

          width: '480px',
          height: '150px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '26px',
            ...glassStyle,
          }}
        />

        {/* DRS */}
        <div
          style={{
            position: 'absolute',
            left: '24px',
            top: '24px',

            color: '#00FF9D',

            fontSize: '12px',

            letterSpacing: '0.2em',

            fontFamily:
              'Orbitron, sans-serif',

            textShadow:
              '0 0 10px rgba(0,255,157,0.5)',
          }}
        >
          DRS ACTIVE
        </div>

        {/* SPEED */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '10px',

            transform:
              'translateX(-50%)',

            fontSize: '74px',
            fontWeight: 900,

            color: '#ffffff',

            fontFamily:
              'Orbitron, sans-serif',

            textShadow:
              '0 0 14px rgba(255,255,255,0.18)',
          }}
        >
          {Math.round(displaySpeed)}
        </div>

        {/* KMH */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '95px',

            transform:
              'translateX(-50%)',

            fontSize: '11px',

            letterSpacing: '0.45em',

            color:
              'rgba(255,255,255,0.5)',

            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          KM/H
        </div>

        {/* GEAR */}
        <div
          style={{
            position: 'absolute',
            right: '30px',
            top: '26px',

            fontSize: '52px',
            fontWeight: 900,

            color: '#00FF9D',

            fontFamily:
              'Orbitron, sans-serif',

            textShadow:
              '0 0 14px rgba(0,255,157,0.5)',
          }}
        >
          {gear}
        </div>

        {/* RPM */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '24px',
            right: '24px',

            height: '8px',

            borderRadius: '999px',

            overflow: 'hidden',

            background:
              'rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              width: `${
                (rpm / 12000) *
                100
              }%`,

              height: '100%',

              background:
                'linear-gradient(90deg,#00FF9D,#00E5FF,#FF0055)',

              boxShadow:
                '0 0 20px rgba(0,255,157,0.4)',

              transition:
                'width 0.15s linear',
            }}
          />
        </div>
      </div>

      {/* FUEL */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',

          width: '180px',

          borderRadius: '22px',

          padding: '16px',

          color: 'white',

          ...glassStyle,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.35em',
            opacity: 0.55,
            marginBottom: '10px',
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          FUEL
        </div>

        <div
          style={{
            fontSize: '36px',
            fontWeight: 900,

            color:
              fuel > 30
                ? '#00FF9D'
                : '#FF3366',

            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          {Math.round(fuel)}%
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',

            borderRadius: '999px',

            background:
              'rgba(255,255,255,0.08)',

            marginTop: '12px',

            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${fuel}%`,
              height: '100%',

              background:
                fuel > 30
                  ? '#00FF9D'
                  : '#FF3366',

              boxShadow:
                fuel > 30
                  ? '0 0 14px #00FF9D'
                  : '0 0 14px #FF3366',
            }}
          />
        </div>
      </div>

      {/* TYRES */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '230px',

          width: '150px',

          borderRadius: '22px',

          padding: '16px',

          color: 'white',

          ...glassStyle,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.35em',
            opacity: 0.55,
            marginBottom: '10px',
            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          TYRES
        </div>

        <div
          style={{
            fontSize: '34px',
            fontWeight: 900,

            color: '#FFAA33',

            fontFamily:
              'Orbitron, sans-serif',
          }}
        >
          92°
        </div>

        <div
          style={{
            marginTop: '10px',

            display: 'flex',

            gap: '6px',
          }}
        >
          {[1, 2, 3, 4].map((t) => (
            <div
              key={t}
              style={{
                flex: 1,

                height: '6px',

                borderRadius:
                  '999px',

                background:
                  '#FFAA33',

                boxShadow:
                  '0 0 10px #FFAA33',
              }}
            />
          ))}
        </div>
      </div>
      {/* LIVES */}
<div
  style={{
    position: 'fixed',

    bottom: '70%',

    left: '50%',

    transform: 'translateX(-50%)',

    display: 'flex',

    gap: '30px',

    zIndex: 50,
  }}
>
  {[1, 2, 3].map((life) => (
    <div
      key={life}
      style={{
        width: '50px',
        height: '50px',

        borderRadius: '50%',

        background:
          life <= lives
            ? '#ff2bd6'
            : 'rgba(255,255,255,0.08)',

        border:
          life <= lives
            ? '3px solid #ff6ae1'
            : '2px solid rgba(255,255,255,0.15)',

        boxShadow:
          life <= lives
            ? `
              0 0 12px #ff2bd6,
              0 0 24px #ff2bd6,
              0 0 48px rgba(255,43,214,0.9),
              0 0 90px rgba(255,43,214,0.6)
            `
            : 'none',

        backdropFilter: 'blur(6px)',

        transition: 'all 0.25s ease',
      }}
    />
  ))}
</div>
    </div>
  )
})