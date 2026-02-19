export const getMotionGroupDescription = {
  method: "GET",
  path: "/cells/:cellId/controllers/:controllerId/motion-groups/:motionGroupId/description",
  handle() {
    return {
      motion_group_model: "UniversalRobots_UR5e",
      mounting: {
        position: [0, 0, 0],
        orientation: [0, 0, 0],
      },
      tcps: {
        Flange: {
          name: "Default-Flange",
          pose: {
            position: [0, 0, 0],
            orientation: [0, 0, 0],
          },
        },
      },
      payloads: {
        "FPay-0": {
          name: "FPay-0",
          payload: 0,
          center_of_mass: [0, 0, 0],
          moment_of_inertia: [0, 0, 0],
        },
      },
      cycle_time: 8,
      dh_parameters: [
        {
          alpha: 1.5707963267948966,
          d: 162.25,
        },
        {
          a: -425,
        },
        {
          a: -392.2,
        },
        {
          alpha: 1.5707963267948966,
          d: 133.3,
        },
        {
          alpha: -1.5707963267948966,
          d: 99.7,
        },
        {
          d: 99.6,
        },
      ],
      operation_limits: {
        auto_limits: {
          joints: [
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
          ],
          tcp: {
            velocity: 5000,
          },
          elbow: {
            velocity: 5000,
          },
          flange: {
            velocity: 5000,
          },
        },
        manual_limits: {
          joints: [
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
          ],
          tcp: {
            velocity: 5000,
          },
        },
        manual_t1_limits: {
          joints: [
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
          ],
          tcp: {
            velocity: 5000,
          },
        },
        manual_t2_limits: {
          joints: [
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 150,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
            {
              position: {
                lower_limit: -6.283185307179586,
                upper_limit: 6.283185307179586,
              },
              velocity: 3.34159255027771,
              acceleration: 40,
              torque: 28,
            },
          ],
          tcp: {
            velocity: 5000,
          },
        },
      },
      serial_number: "WBVirtualRobot",
    }
  },
}
