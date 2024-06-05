import React from 'react'
import {
  Center,
  Flex,
  Text,
  Stack,
  Paper,
  Divider,
  Button as MantineButton,
  Anchor,
  Avatar
} from '@mantine/core'
import SlackLogo from '../../../components/slack-logo'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import axios from '../../../services/axios'
import { notifications } from '@mantine/notifications'
import { NextPage } from 'next'
import { useAppContext } from '../../../providers/app-provider'
import { ApiError, Data } from '../../../utils/interfaces'
import { getColorByIndex } from '../../../utils/helpers'



const Register: NextPage = () => {
    const router = useRouter()
    const { setData } = useAppContext()
    const organisationId = router.query.id
    
    
    function handleOpenWorkspace(organisation: Data) {
        setData(undefined)
        localStorage.setItem('organisationId', organisation?._id)
        router.push(`/c/${organisation?.channels?.[0]?._id}`)
        localStorage.setItem('channel', 'true')
    }

    const query = useQuery(
        ['organisation'],
        () => axios.get(`organisation/${organisationId}`),
        {
        refetchOnMount: false,
        enabled: !!organisationId,
        }
    )

    const organisation = query?.data?.data?.data


  return (
    <Center p="xl" h="100vh" w="100vw" bg="#111317">
      <Stack justify="between">
        <Flex direction="column" align="center">
          <SlackLogo />
          <Text fz="3xl" fw={600} mt="3xl" c="white">
            You have been invited to join a workspace on SUP'SPACE
                  </Text>   
          <Text fz="sm" mt="xs">
            Do you want to accept this invite to join{' '}
            <Text span fw={600}>
                {organisation?.name}              
            </Text>
            ?          
          </Text>
          <Paper radius="md" p="xl" withBorder w={'40rem'} mt="xl">
                <Stack>
                  <Center>      
                    <Avatar
                        size="xl"
                        color={getColorByIndex(2)}
                        radius="xl"
                        my="l"
                    >
                        {organisation ? organisation?.name[0].toUpperCase() : "IW"}
                    </Avatar>
                  </Center>
                    <MantineButton
                        variant="outline"
                        color="cyan"
                        onClick={() => handleOpenWorkspace(organisation)}
                          >
                              Accept invite
                    </MantineButton>
                          
              <Divider label="Collaborators" labelPosition="center" my="md" />
              <Center>
                <Avatar.Group>
                {organisation?.coWorkers?.length > 4 ? (
                    <>
                        {organisation?.coWorkers?.slice(0, 4).map((member: any, index: number) => {
                            return (
                                <Avatar
                                    key={member._id}
                                    src={`/avatars/${member.username[0].toLowerCase()}.png`}
                                    size="lg"
                                    radius="lg"
                                    color={getColorByIndex(2)}
                                    title={member.username}
                                />
                            )
                        })}
                        <Avatar radius="xl">{organisation?.coWorkers?.length - 4}</Avatar>
                    </>
                ) : (
                    <>
                        {organisation?.coWorkers?.map((member: any, index: number) => {
                            return (
                                <Avatar
                                    key={member._id}
                                    src={`/avatars/${member.username[0].toLowerCase()}.png`}
                                    size="lg"
                                    radius="lg"
                                    color={getColorByIndex(2)}
                                    title={member.username}
                                />
                            )
                        })}
                    </>
                )}
                </Avatar.Group>
                </Center>
                <Stack spacing="xs" mt="lg">
                  <Text size="xs" align="center">
                    Was there a mistake?
                  </Text>
                  <Anchor size="xs" align="center" href="/signin">
                    Accept suspicious invites at your own discretion. 
                  </Anchor>
                </Stack>
              </Stack>
          </Paper>
        </Flex>
      </Stack>
    </Center>
  )
}

export default Register
