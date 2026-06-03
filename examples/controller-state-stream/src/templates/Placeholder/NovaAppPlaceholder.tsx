import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  LoadingCover,
  NoMotionGroupModal,
} from "@wandelbots/wandelbots-js-react-components/core";
import Image from "next/image";
import { useControllerState } from "@/hooks/useControllerState.ts";
import { env } from "@/runtimeEnv.ts";
import AnimatedBackground from "./AnimatedBackground.tsx";
import wandelbots from "./wbnova.svg";

const CustomCard = styled(Card)({
  background: "none",
  borderRadius: "15px",
  margin: "10px",
  width: "300px",
});

const BlurredCard = styled(Card)({
  backgroundColor: "#ffffff11",
  borderRadius: "8px",
  marginTop: "100px",
  padding: "8px 24px",
  border: "1px solid #ffffff22",
  backdropFilter: "blur(50px)",
});

export const NovaAppPlaceholder = ({ controller }: { controller: string }) => {
  const { controllerState, error } = useControllerState(controller);
  const motionGroup = controllerState?.motion_groups?.[0];

  if (!controllerState) {
    return <LoadingCover error={error} />;
  }

  if (!motionGroup) {
    return <NoMotionGroupModal baseUrl={env.NOVA_DEV_INSTANCE_URL || ""} />;
  }

  return (
    <>
      <AnimatedBackground />
      <Box display="flex" flexDirection="column" height="100vh">
        <Box alignSelf="flex-start" ml={7} mt={5}>
          <Image
            src={wandelbots}
            alt="Wandelbots"
            width={465 / 3.5}
            height={76 / 3.5}
          />
        </Box>

        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <BlurredCard style={{ maxWidth: "500px" }}>
            <CardContent>
              <Typography
                variant="body2"
                color="white"
                fontFamily={"Monaco"}
                sx={{ marginTop: "8px", marginBottom: "14px" }}
              >
                Welcome dear{" "}
                <span style={{ color: "#F3C832" }}>Developer :]</span>
              </Typography>
              <Typography variant="body2" color="white" fontFamily={"Monaco"}>
                → Get started by editing{" "}
                <span style={{ color: "#49D4FF" }}>
                  src/app/NovaAppMain.tsx
                </span>
              </Typography>
            </CardContent>
          </BlurredCard>
        </Box>

        <Box pb={5} ml={15} mr={15}>
          <Stack direction="column" spacing={2} justifyContent="space-between">
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <CustomCard>
                <CardContent>
                  <Typography variant="body2" color="white" component="div">
                    <Stack
                      direction="column"
                      justifyContent="flex-start"
                      alignItems="flex-start"
                      spacing={0.5}
                      letterSpacing={0.6}
                    >
                      <span style={{ color: "#ffffff88" }}>
                        Connection status:
                      </span>
                      <span style={{ color: "#2affbf" }}>connected</span>
                      <br />
                      <span style={{ color: "#ffffff88" }}>
                        Connected with:
                      </span>
                      <span>{motionGroup.motion_group}</span>
                    </Stack>
                  </Typography>
                </CardContent>
              </CustomCard>

              <CustomCard>
                <CardContent>
                  <Typography variant="body2" color="white" component="div">
                    <Stack
                      direction="column"
                      justifyContent="flex-start"
                      alignItems="flex-start"
                      spacing={0.5}
                      letterSpacing={0.6}
                    >
                      <span style={{ color: "#ffffff88" }}>Robot pose:</span>
                      {motionGroup.joint_position.map((joint, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Joints are always in a specific order
                        <span key={index}>
                          Joint {index + 1}:{" "}
                          {Math.round((joint * 180) / Math.PI)}°
                        </span>
                      ))}
                    </Stack>
                  </Typography>
                </CardContent>
              </CustomCard>

              <CustomCard>
                <CardContent>
                  <Typography variant="body2" color="white" component="div">
                    <Stack
                      direction="column"
                      justifyContent="flex-start"
                      alignItems="flex-start"
                      spacing={0.5}
                      letterSpacing={0.6}
                    >
                      <span style={{ color: "#ffffff88" }}>Useful links:</span>
                      <span>Manage your instance or get help:</span>
                      <Link
                        color="#6558FF"
                        href="https://portal.wandelbots.io/"
                      >
                        Dev Portal
                      </Link>
                      <br />
                      <span>Move robot:</span>
                      <Link
                        color="#6558FF"
                        href={env.NOVA_DEV_INSTANCE_URL || "/"}
                      >
                        {env.NOVA_DEV_INSTANCE_URL || window.location.origin}
                      </Link>
                    </Stack>
                  </Typography>
                </CardContent>
              </CustomCard>
            </Stack>
            <Divider color="#ffffff" sx={{ opacity: 0.2 }}></Divider>
          </Stack>
        </Box>
      </Box>
    </>
  );
};
