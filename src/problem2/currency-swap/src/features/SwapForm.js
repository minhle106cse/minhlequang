import React, { useState, useEffect } from 'react'
import { Form, Select, message, InputNumber, Space, Spin } from 'antd'
import axios from 'axios'

const SwapForm = () => {
	const [currencies, setCurrencies] = useState([])
	const [loading, setLoading] = useState(true)

	const [form] = Form.useForm()
	const formValues = Form.useWatch([], form)

	useEffect(() => {
		const fetchDate = async () => {
			await axios
				.get('https://interview.switcheo.com/prices.json')
				.then((response) => {
					setCurrencies(
						response.data.map((item) => ({
							token: item.currency,
							price: item.price
						}))
					)
				})
				.catch(() => {
					message.error('Failed to fetch token prices.')
				})
				.finally(() => {
					setTimeout(() => {
						setLoading(false)
					}, 2000)
				})
		}

		fetchDate()
	}, [])

	const handleSwap = (values) => {
		console.log(values)
		const { sendAmount, receiveAmount } = values

		if (sendAmount?.token && receiveAmount?.token) {
			const sendPrice = currencies.find(
				(item) => item.token === sendAmount.token
			).price
			const receivePrice = currencies.find(
				(item) => item.token === receiveAmount.token
			).price

			const rate = sendPrice / receivePrice
			const amount = rate * sendAmount?.amount

			form.setFieldValue(['receiveAmount', 'amount'], amount)
			console.log(form.getFieldsValue())
		} else {
			message.error('Invalid token selected.')
		}
	}

	const customizeRequiredMark = (label, { required }) => (
		<>
			{label}
			{required && <span style={{ color: 'red' }}>&nbsp;*</span>}
		</>
	)
	console.log(form.getFieldsValue())

	return (
		<Spin spinning={loading}>
			<Form
				form={form}
				onFinish={handleSwap}
				layout="vertical"
				className="swap-form"
				requiredMark={customizeRequiredMark}
			>
				<h2 className="swap-form__title">Currency Swap</h2>

				<Form.Item className="antd-form-item" label="Amount to send">
					<Space.Compact style={{ width: '100%' }}>
						<Form.Item
							initialValue="USD"
							name={['sendAmount', 'token']}
							noStyle
						>
							<Select
								className="antd-select"
								style={{ width: 'fit-content' }}
								placeholder={`Select form token`}
								options={currencies
									?.filter(
										(item, index, self) =>
											index === self.findIndex((t) => t.token === item.token)
									)
									.map((currency) => ({
										label: (
											<>
												<img
													src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency.token}.svg`}
													alt={currency.token}
													width="20"
												/>
												{currency.token}
											</>
										),
										value: currency.token
									}))}
							/>
						</Form.Item>
						<Form.Item initialValue="0" name={['sendAmount', 'amount']} noStyle>
							<InputNumber
								className="antd-input-number"
								placeholder="Enter amount"
								min={0}
								formatter={(value) => {
									return `${formValues?.sendAmount.token ?? ''} ${value}`
								}}
								parser={(value) => {
									let cleanedValue
									cleanedValue = value?.split(' ')?.[1]

									if (cleanedValue === '') {
										return 0
									}

									return Number(cleanedValue)
								}}
							/>
						</Form.Item>
					</Space.Compact>
				</Form.Item>

				<Form.Item
					className="antd-form-item"
					label="Amount to receive"
					name="receiveAmount"
					rules={[
						{ required: true, message: 'Please input the amount to send!' }
					]}
				>
					<Space.Compact style={{ width: '100%' }}>
						<Form.Item name={['receiveAmount', 'token']} noStyle>
							<Select
								className="antd-select"
								style={{ width: 'fit-content' }}
								placeholder={`Select form token`}
								options={currencies
									?.filter(
										(item, index, self) =>
											index === self.findIndex((t) => t.token === item.token)
									)
									.map((currency) => ({
										label: (
											<>
												<img
													src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency.token}.svg`}
													alt="Token"
													width="20"
												/>
												{currency.token}
											</>
										),
										value: currency.token
									}))}
							/>
						</Form.Item>
						<Form.Item name={['receiveAmount', 'amount']} noStyle>
							<InputNumber
								className="antd-input-number"
								min={0}
								formatter={(value) =>
									`${formValues?.receiveAmount.token ?? ''} ${Number(
										value
									)?.toFixed(2)}`
								}
								disabled
							/>
						</Form.Item>
					</Space.Compact>
				</Form.Item>

				<button type="submit" className="swap-form__cta">
					Confirm Swap
				</button>
			</Form>
		</Spin>
	)
}

export default SwapForm
