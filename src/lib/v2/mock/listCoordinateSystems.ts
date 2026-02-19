export const listCoordinateSystems = {
  method: "GET",
  path: "/cells/:cellId/controllers/:controllerId/coordinate-systems",
  handle() {
    return [
      {
        coordinate_system: "",
        name: "world",
        reference_coordinate_system: "",
        position: [0, 0, 0],
        orientation: [0, 0, 0],
        orientation_type: "ROTATION_VECTOR",
      },
      {
        coordinate_system: "CS-0",
        name: "Default-CS",
        reference_coordinate_system: "",
        position: [0, 0, 0],
        orientation: [0, 0, 0],
        orientation_type: "ROTATION_VECTOR",
      },
    ]
  },
}
