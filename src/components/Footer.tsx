import { Box, Typography, IconButton, Stack, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      className="mt-auto py-4 w-full bg-white/60 border-t border-gray-300 backdrop-blur"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2 }}
        className="text-sm text-gray-600"
      >
        {/* Left side: Text and link */}
        <Typography variant="body2" sx={{ color: "#999", fontSize: "0.8rem" }}>
          © {year} Flashly |{" "}
          <Link
            href="https://andris811.github.io/avdev/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ color: "#999" }}
          >
            AVDev
          </Link>
        </Typography>

        {/* Right side: Social icons */}
        <Stack direction="row" spacing={1}>
          <IconButton
            component="a"
            href="https://github.com/andris811"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ color: "#999" }}
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://linkedin.com/in/andrasv89"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ color: "#999" }}
          >
            <LinkedInIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;