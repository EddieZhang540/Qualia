import React, { useState, useEffect } from "react";
import {
  Stat,
  StatHelpText,
  StatArrow,
  Flex,
  Wrap,
  WrapItem,
  Text,
  Divider,
  IconButton,
  SlideFade,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { monthDisplay, orangeShades } from "../utils/summaryConstants";
import { FaBookOpen, FaBook } from "react-icons/fa";
import { BsBookmarksFill } from "react-icons/bs";
import CountUp from "react-countup";
import { getUserStatsAPI } from "../api/index";
import { useSelector } from "react-redux";
import { selectUser } from "../features/user/userSlice";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";
import { Radar, Line, Bar } from "react-chartjs-2";
import RCZoom from "chartjs-plugin-zoom";
import { formatLabel } from "../utils/formatLabel";
import { useHistory } from "react-router-dom";

ChartJS.register(RadialLinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, Title, RCZoom);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.plugins.title.font.size = 20;

const Summary = () => {
  const user = useSelector(selectUser);
  const history = useHistory();
  const today = new Date();
  const currentMonth = today.getFullYear() + "_" + (today.getMonth() + 1 + "").padStart(2, "0");
  const prevMonth = today.getFullYear() + "_" + (today.getMonth() + "").padStart(2, "0");

  const [userStats, setUserStats] = useState({});
  const [pagesThisMonth, setPagesThisMonth] = useState(0);
  const [pagesDifference, setPagesDifference] = useState();
  const [latestSubjects, setLatestSubjects] = useState([]);
  const [cumulativeSubjectTop5, setCumulativeSubjectTop5] = useState([]);
  const [authorData, setAuthorData] = useState([]);

  useEffect(() => {
    const fetchUserStats = async () => {
      const response = await getUserStatsAPI(user.userInfo._id);
      setUserStats(response.data);
      const latestMonth = response.data.monthlyPages.length;
      if (latestMonth > 0) {
        // latestSubjects
        setLatestSubjects(response.data.monthlySubjectDistributionCumulative[latestMonth - 1].distribution.slice(0, 5));
        // subjectDistributionEvolution
        let subjectEvolution = [];
        let subjectTimeSeries = {};
        for (let i = 0; i < latestMonth; i++) {
          for (const d of response.data.monthlySubjectDistributionCumulative[i].distribution.slice(0, 5)) {
            if (!subjectTimeSeries[d.subject]) {
              subjectTimeSeries[d.subject] = [];
              while (subjectTimeSeries[d.subject].length < i) subjectTimeSeries[d.subject].push(0);
            } else {
              if (subjectTimeSeries[d.subject].length < i + 1) {
                while (subjectTimeSeries[d.subject].length < i) subjectTimeSeries[d.subject].push(0);
              }
            }
            subjectTimeSeries[d.subject].push(d.frequency);
          }
        }
        let orangeShade = 0;
        for (const s of Object.keys(subjectTimeSeries)) {
          subjectEvolution.push({
            label: s,
            data: subjectTimeSeries[s],
            backgroundColor: orangeShades[orangeShade],
            borderColor: orangeShades[5],
            borderWidth: 1,
          });
          orangeShade++;
          if (orangeShade === 5) orangeShade = 0;
        }
        setCumulativeSubjectTop5(subjectEvolution);
        // authorData
        setAuthorData(
          response.data.authorDistribution.slice(0, 5).map((e) => (
            <Tr key={e.author}>
              <Td>{e.author}</Td>
              <Td>{e.frequency}</Td>
            </Tr>
          ))
        );
        // monthlyPages
        if (response.data.monthlyPages[latestMonth - 1].month === currentMonth) {
          setPagesThisMonth(response.data.monthlyPages[latestMonth - 1].count);
          if (latestMonth > 1 && response.data.monthlyPages[latestMonth - 2].month === prevMonth) {
            const prevPages = response.data.monthlyPages[latestMonth - 2].count;
            setPagesDifference(Math.round(((response.data.monthlyPages[latestMonth - 1].count - prevPages) / prevPages) * 100));
          }
        }
      }
    };
    fetchUserStats();
  }, [currentMonth, prevMonth, user]);

  return (
    <Flex w='100%' h='100%' direction='column' overflowY='scroll' overflowX='hidden'>
      {userStats?.totalBooks ? (
        <>
          <SlideFade in={userStats}>
            <Wrap justify='space-between' mt='10px' mr='25px' spacingY='30px'>
              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' py='22px' px='5px'>
                <Flex px='25px' flexDir='column'>
                  <Text fontSize='19px'>Pages read this month</Text>
                  <Flex align='end'>
                    <Text fontSize='30px' fontWeight='bold' mr='20px'>
                      <CountUp start={0} end={pagesThisMonth} duration={0.5} />
                    </Text>
                    {Math.abs(pagesDifference) > 0.01 ? (
                      <Stat>
                        <StatHelpText fontSize='18px'>
                          <StatArrow type={pagesDifference >= 0 ? "increase" : "decrease"} />
                          <CountUp start={0} end={Math.abs(pagesDifference)} decimals={2} duration={0.6} />%
                        </StatHelpText>
                      </Stat>
                    ) : null}
                  </Flex>
                </Flex>
                <Divider orientation='vertical' />
                <Flex px='25px' flexDir='column'>
                  <Text fontSize='19px'>Total pages read</Text>
                  <Text fontSize='30px' fontWeight='bold' mr='20px'>
                    <CountUp start={0} end={userStats.totalPages} duration={0.5} />
                  </Text>
                </Flex>
                <Flex pr='25px' h='100%' align='center'>
                  <IconButton size='lg' _focus={{ outline: "none" }} borderRadius='17' colorScheme='orange' fontSize='25px' icon={<FaBookOpen />} />
                </Flex>
              </WrapItem>

              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' py='22px' px='5px'>
                <Flex px='25px' flexDir='column'>
                  <Text fontSize='19px'>Total books read</Text>
                  <Text fontSize='30px' fontWeight='bold' mr='20px'>
                    <CountUp start={0} end={userStats.totalBooks} duration={0.5} />
                  </Text>
                </Flex>
                <Flex pr='25px' h='100%' align='center'>
                  <IconButton size='lg' _focus={{ outline: "none" }} borderRadius='17' colorScheme='orange' fontSize='25px' icon={<FaBook />} />
                </Flex>
              </WrapItem>

              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' py='22px' px='5px'>
                <Flex px='25px' flexDir='column'>
                  <Text fontSize='19px'>Books planning to read</Text>
                  <Text fontSize='30px' fontWeight='bold' mr='20px'>
                    <CountUp start={0} end={userStats.totalBooksReadLater} duration={0.5} />
                  </Text>
                </Flex>
                <Divider orientation='vertical' />
                <Flex px='25px' flexDir='column'>
                  <Text fontSize='19px'>Books currently reading</Text>
                  <Text fontSize='30px' fontWeight='bold' mr='20px'>
                    <CountUp start={0} end={userStats.totalBooksCurrentlyReading} duration={0.5} />
                  </Text>
                </Flex>
                <Flex pr='25px' h='100%' align='center'>
                  <IconButton size='lg' _focus={{ outline: "none" }} borderRadius='17' colorScheme='orange' fontSize='25px' icon={<BsBookmarksFill />} />
                </Flex>
              </WrapItem>
            </Wrap>

            <Wrap justify='space-between' mt='10px' mr='25px' spacingY='30px'>
              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' pt='25px' px='15px' w='38%'>
                <Flex w='100%'>
                  <Radar
                    data={{
                      labels: latestSubjects.map((e) => formatLabel(e.subject, 10)),
                      datasets: [
                        {
                          label: "Total books read",
                          data: latestSubjects.map((e) => e.frequency),
                          backgroundColor: orangeShades[6],
                          borderColor: orangeShades[5],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      scale: { min: 0, precision: 0 },
                      scales: { r: { pointLabels: { font: { size: 16 } } } },
                      plugins: {
                        title: { display: true, text: "Your Top Genres of All Time" },
                      },
                    }}
                  />
                </Flex>
              </WrapItem>
              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' py='25px' px='30px' w='58%'>
                <Flex w='100%' h='100%' align='center'>
                  <Bar
                    data={{
                      labels: userStats.monthlySubjectDistributionCumulative?.map(
                        (e) => monthDisplay[e.month?.split("_")[1] - 1] + ", " + e.month.split("_")[0]
                      ),
                      datasets: cumulativeSubjectTop5,
                    }}
                    options={{
                      scale: { min: 0, precision: 0, stepSize: 1 },
                      plugins: {
                        zoom: { zoom: { wheel: { enabled: true }, mode: "x" }, pan: { enabled: true, mode: "x" } },
                        legend: { display: false },
                        title: { display: true, text: "Your Top Genres Over the Months (Cumulative)" },
                      },
                      scales: { x: { stacked: true }, y: { stacked: true } },
                    }}
                  />
                </Flex>
              </WrapItem>
            </Wrap>

            <Wrap justify='space-between' mt='10px' mr='25px' spacingY='30px'>
              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' py='25px' px='30px' w='58%'>
                <Flex w='100%' h='100%' align='center'>
                  <Line
                    data={{
                      labels: userStats.monthlyPagesCumulative?.map((e) => monthDisplay[e.month.split("_")[1] - 1] + ", " + e.month.split("_")[0]),
                      datasets: [
                        {
                          label: "Total pages read",
                          data: userStats.monthlyPagesCumulative?.map((e) => e.count),
                          backgroundColor: orangeShades[0],
                          borderColor: orangeShades[5],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      scale: { min: 0, precision: 0, stepSize: 100 },
                      plugins: {
                        zoom: { zoom: { wheel: { enabled: true }, mode: "x" }, pan: { enabled: true, mode: "x" } },
                        title: { display: true, text: "Total Pages You Read Since the Beginning" },
                      },
                    }}
                  />
                </Flex>
              </WrapItem>
              <WrapItem shadow='md' borderRadius='18px' bg='whiteAlpha.700' py='25px' px='30px' w='38%'>
                <Flex w='100%' h='100%' flexDir='column' align='center' justify='center'>
                  <Text fontWeight='bold' fontSize='20px' color='#666666'>
                    Your Top Authors of All Time
                  </Text>
                  <TableContainer w='100%'>
                    <Table variant='striped' colorScheme='orange'>
                      <Thead>
                        <Tr>
                          <Th>Author</Th>
                          <Th>Books</Th>
                        </Tr>
                      </Thead>
                      <Tbody>{authorData}</Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
              </WrapItem>
            </Wrap>
          </SlideFade>
        </>
      ) : userStats?.totalBooks === 0 ? (
        <Flex py='8px' key='-1' justify='center'>
          Nothing yet! Look for a book to read in&nbsp;
          <Link
            onClick={() => {
              history.push("/Browse");
            }}
            color={"orangeDim"}
          >
            Browse
          </Link>
          ?
        </Flex>
      ) : (
        <Flex justify='center'>
          <Spinner size='xl' />
        </Flex>
      )}
    </Flex>
  );
};

export default Summary;
